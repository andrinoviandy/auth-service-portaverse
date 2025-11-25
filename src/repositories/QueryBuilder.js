const { selectQuery } = require("../models");
const fs = require("fs");
class Query {
  constructor() {
    this._baseQuery = {
      query: "",
      options: {
        flatQuery: true,
        count: {
          by: null,
          distinct: false,
        },
      },
    };
    this._cte = null;
    this.transaction = null;
    this._replacement = {};
    this._pagination = {};
    this._queryEngine = selectQuery;
    this._options = {
      returnObject: false,
      returnCount: true,
    };
    this._selectAttributes = [];
    this._sourceTable = [];
    this._relationTable = {
      leftJoin: [],
      innerJoin: [],
      rightJoin: [],
    };
  }

  get queryEngine() {
    return this._queryEngine;
  }

  get completeQuery() {
    const limit = +this.pagination.size;
    const offset = (+this.pagination.page - 1) * limit;
    const fromObjectQuery = `${this._formatAttributes()}\n${this._formatSourceTable()}\n${this._formatRelationTable()}`;
    const cteElement = `${this.cte ? `WITH ${this._formatCte()}` : ""}`;
    const baseQueryElement = `${
      this.query.options.flatQuery ? this.query.query : fromObjectQuery
    }`;
    const paginationElement = `${
      !this._isEmptyObject(this.pagination)
        ? `LIMIT ${limit} OFFSET ${offset}`
        : ""
    }`;
    return `${cteElement}\n${baseQueryElement}\n${paginationElement}`;
  }

  get selectAttributes() {
    return this._selectAttributes;
  }

  get sourceTable() {
    return this._sourceTable;
  }

  get relationTable() {
    return this._relationTable;
  }

  get query() {
    return this._baseQuery;
  }

  get replacement() {
    return this._replacement;
  }

  get cte() {
    return this._cte;
  }

  get pagination() {
    return this._pagination;
  }

  get options() {
    return this._options;
  }

  get cteNames() {
    if (Array.isArray(this.cte)) {
      return this.cte.map((e) => e.name);
    }

    return [this.cte.name];
  }

  set query(value) {
    if (!value.options.flatQuery) {
      if (this._isEmptyObject(value.query)) {
        throw new Error("should be an Object if flatQuery option set to false");
      }
      this.query.query = value.query;
      this._sourceTable = value.query.fromTable;

      if (value.query.select) {
        this._selectAttributes = value.query.select;
      }

      if (value.query.relation) {
        this._relationTable = value.query.relation;
      }
    } else {
      if (!(typeof value.query === "string" || value.query instanceof String)) {
        throw new Error(
          "should be a literal string if flatQuery option set to true"
        );
      }
      this._baseQuery.query = value.query;
      this._baseQuery.options = { ...this.query.options, ...value.options };
    }
  }

  set cte(value) {
    this._cte = value;
  }

  set replacement(value) {
    this._replacement = value;
  }

  set pagination(value) {
    const paginationKey = ["page", "size"];

    if (
      this._isEmptyObject(value) &&
      !paginationKey.every((e) => value.hasOwnProperty(e))
    ) {
      throw new Error(
        "Pagination should be an Object of { page: integer, size: integer}"
      );
    }

    if (!(+value.page && +value.size)) {
      throw new Error("page and size shouldn't be null or empty or string");
    }

    this._pagination = value;
  }

  set options(value) {
    this._options = value;
  }

  _pushRelationJoin(relations, type) {
    const typeReference = Object.freeze({
      left: "leftJoin",
      right: "rightJoin",
      inner: "innerJoin",
    });

    const relationExist = this._relationTable[typeReference[type]];

    if (Array.isArray(relations)) {
      if (relationExist && Array.isArray(relationExist)) {
        relationExist.push(...relations);
      } else if (relationExist && !this._isEmptyObject(relationExist)) {
        this._relationTable[typeReference[type]] = [
          relationExist,
          ...relations,
        ];
      } else {
        this._relationTable[typeReference[type]] = relations[0];
      }
    } else {
      if (relationExist && Array.isArray(relationExist)) {
        relationExist.push(relations);
      } else if (relationExist && !this._isEmptyObject(relationExist)) {
        this._relationTable[typeReference[type]] = Array.of(
          relationExist,
          relations
        );
      } else {
        this._relationTable[typeReference[type]] = relations;
      }
    }
  }

  async _countAll() {
    const countBy = this.query.options.count.by;
    const isDistinct = this.query.options.count.distinct;

    if (
      !(
        typeof countBy === "string" ||
        countBy instanceof String ||
        countBy === null
      )
    ) {
      throw new Error(
        "count.by options of query should be a string. hint: check alias column of the flat query"
      );
    }

    const countQuery = `
            ${this.cte ? `WITH ${this._formatCte()},` : ""}
            ${this.cte ? "" : "WITH "}final_data AS (
                ${this.query.query}
            )
            SELECT ${
              countBy
                ? `COUNT(${isDistinct ? "DISTINCT " : ""}${countBy})`
                : "COUNT(*)"
            } AS count
            FROM final_data
        `;

    const options = {};
    if (this.transaction) {
      options.transaction = this.transaction;
    }
    return await this.queryEngine(countQuery, this.replacement, options);
  }

  _isEmptyObject(object) {
    return object && Object.keys(object).length === 0;
  }

  _formatCte() {
    if (Array.isArray(this.cte)) {
      return this.cte
        .map((props) => `${props.name} AS (\n\t${props.query}\n)`)
        .join(", ");
    }

    return `${this.cte.name} AS (\n\t${this.cte.query}\n)`;
  }

  _formatSourceTable() {
    if (Array.isArray(this.sourceTable)) {
      return `FROM ${this.sourceTable[0]} ${this.sourceTable[1]}`;
    }

    return `FROM ${this.sourceTable}`;
  }

  _formatRelationTable() {
    const relationStore = [];
    const relationKeyReference = Object.freeze({
      leftJoin: "LEFT JOIN",
      rightJoin: "RIGHT JOIN",
      innerJoin: "INNER JOIN",
    });
    const relationExist = Object.keys(this.relationTable);

    for (const r of relationExist) {
      const relationJoinStore = [];
      const relationTable = this.relationTable[r];

      if (Array.isArray(relationTable)) {
        for (const el of relationTable) {
          const isArrayAttr = Array.isArray(el.table);
          const [tableName, alias] = isArrayAttr
            ? [el.table[0], el.table[1]]
            : [el.table];
          const sanitizeJoin = `${relationKeyReference[r]} ${
            isArrayAttr ? `${tableName} ${alias}` : `${tableName}`
          }\n\tON ${
            isArrayAttr ? `${alias}.${el.on}` : `${tableName}.${el.on}`
          } = ${el.referenceAlias}.${el.on}`;
          relationJoinStore.push(sanitizeJoin);
        }
      } else {
        const isArrayAttr = Array.isArray(relationTable.table);
        const [tableName, alias] = isArrayAttr
          ? [relationTable.table[0], relationTable.table[1]]
          : [relationTable.table];
        const sanitizeJoin = `${relationKeyReference[r]} ${
          isArrayAttr ? `${tableName} ${alias}` : `${tableName}`
        }\n\tON ${
          isArrayAttr
            ? `${alias}.${relationTable.on}`
            : `${tableName}.${relationTable.on}`
        } = ${relationTable.referenceAlias}.${relationTable.on}`;
        relationJoinStore.push(sanitizeJoin);
      }

      relationStore.push(...relationJoinStore);
    }

    return relationStore.join("\n");
  }

  _formatAttributes() {
    let selectAttributes = [];

    if (!this.selectAttributes.length) {
      return "SELECT *";
    }

    if (Array.isArray(this.selectAttributes)) {
      for (const sl of this.selectAttributes) {
        for (const att of sl.attributes) {
          const sanitizeSelect = `${sl.alias}.${
            Array.isArray(att) ? `${att[0]} AS ${att[1]}` : `${att}`
          }`;
          selectAttributes.push(sanitizeSelect);
        }
      }
    } else {
      for (const att of this.selectAttributes.attributes) {
        const sanitizeSelect = `${this.selectAttributes.alias}.${
          Array.isArray(att) ? `${att[0]} AS ${att[1]}` : `${att}`
        }`;
        selectAttributes.push(sanitizeSelect);
      }
    }

    selectAttributes = selectAttributes.join(",\n\t");
    selectAttributes = `SELECT \n\t${selectAttributes}`;
    return selectAttributes;
  }

  async printQuery() {
    await fs.writeFileSync("output.txt", this.completeQuery);
  }

  async execute() {
    const isPaginationExist = !this._isEmptyObject(this.pagination);

    const options = {};
    if (this.transaction) {
      options.transaction = this.transaction;
    }

    const data = await this.queryEngine(
      this.completeQuery,
      this.replacement,
      options
    );

    if (this.options.returnCount && isPaginationExist) {
      const [dataCount] = await this._countAll();
      const pageCount = Math.ceil(dataCount.count / this.pagination.size);
      return {
        data,
        dataCount: dataCount.count,
        pageCount,
      };
    }

    if (this.options.returnObject) {
      return data[0];
    }

    return data;
  }
}

class QueryBuilder extends Query {
  constructor() {
    super();
  }

  setQuery(query, options) {
    this.query = { query, options: { ...this.query.options, ...options } };
    return this;
  }

  setCte(cte) {
    this.cte = cte;
    return this;
  }

  setReplacement(replacement) {
    this.replacement = replacement;
    return this;
  }

  setPagination(pagination) {
    this.pagination = pagination;
    return this;
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    return this;
  }

  addLeftJoin(relations) {
    this._pushRelationJoin(relations, "left");
    return this;
  }

  addRightJoin(relations) {
    this._pushRelationJoin(relations, "right");
    return this;
  }

  addInnerJoin(relations) {
    this._pushRelationJoin(relations, "inner");
    return this;
  }

  setTransaction(transaction) {
    this.transaction = transaction;
    return this;
  }
}

module.exports.QueryBuilder = QueryBuilder;
