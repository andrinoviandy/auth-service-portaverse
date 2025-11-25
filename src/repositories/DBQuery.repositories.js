const { selectQuery } = require("../models");

class DBQuery {
  /**
   *
   * @param {string} query
   * @param {Object} options
   */
  constructor(query, options) {
    this.query = query;
    this.request = selectQuery;
    this.options = options;
  }

  flush() {
    this.query = ``;
    this.options = {};
    return this;
  }

  setQuery(query) {
    this.query = query;
    return this;
  }

  setOptions(options) {
    this.options = options;
    return this;
  }

  getCount() {
    return this.request(
      `
      SELECT COUNT(*) AS count FROM (
          ${this.query}
      ) tc
      `,
      this.options
    );
  }

  execute(pagination) {
    const limit = +pagination?.limit;
    const offset = +pagination?.offset;
    return this.request(
      `
    ${this.query}
    ${(offset || offset === 0) && limit ? `LIMIT :limit OFFSET :offset` : ""}
    `,
      {
        limit: limit,
        offset: offset,
        ...this.options,
      }
    );
  }

  static getInAndClauseFilter(table, field, value) {
    const fieldDB = table ? `${table}.${field}` : field;
    const queryFilter = value
      ? `AND ${fieldDB} ${
          Array.isArray(value) ? `IN (:${field})` : `= :${field}`
        } `
      : "";

    return [queryFilter, { [field]: value }];
  }

  static getLikeClauseFilter(table, field, value, more) {
    const fieldDB = table ? `${table}.${field}` : field;
    const replacementField = table + field;
    const queryFilter = value
      ? `AND (${fieldDB} ${`LIKE :${replacementField}`} ${
          more?.length
            ? more
                .map((e) => {
                  const fieldDB = table ? `${table}.${field}` : field;
                  return `OR ${fieldDB} ${`LIKE :${replacementField}`}`;
                })
                .join(" ")
            : ""
        }) `
      : "";

    return [queryFilter, { [replacementField]: `%${value}%` }];
  }

  static getCustomClauseFilter(table, field, value, operator) {
    const fieldDB = table ? `${table}.${field}` : field;
    const replacementField = table + field + Math.random();
    const queryFilter = value
      ? `AND ${fieldDB} ${`${operator} :${replacementField}`} `
      : "";

    return [queryFilter, { [replacementField]: value }];
  }

  static clauseFilterBulkGenerator(aoa, method) {
    const queryFilters = [];
    let fieldReplacements = {};

    aoa.forEach((e) => {
      const [queryFilter, fieldReplacement] = method(...e);
      queryFilters.push(queryFilter);
      fieldReplacements = {
        ...fieldReplacements,
        ...fieldReplacement,
      };
    });

    return [queryFilters.join("\n"), fieldReplacements];
  }

  static getLikeClauseFilterBulk(aoa) {
    if (!aoa.length) {
      return "";
    }

    return this.getLikeClauseFilter(
      aoa[0][0],
      aoa[0][1],
      aoa[0][2],
      aoa
        ?.filter((_, idx) => idx !== 0)
        .map((e) => ({
          table: e[0],
          field: e[1],
        }))
    );
  }

  static getInAndClauseFilterBulk(aoa) {
    return this.clauseFilterBulkGenerator(aoa, this.getInAndClauseFilter);
  }

  static getCustomClauseFilterBulk(aoa) {
    return this.clauseFilterBulkGenerator(aoa, this.getCustomClauseFilter);
  }
}

module.exports = DBQuery;
