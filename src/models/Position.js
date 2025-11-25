module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_position`;
  class Position extends Model {
    static getAllPosition({ search, group_id_filter, limit, offset }) {
      return sequelize.query(
        `
          SELECT tp.position_id, tp.name, tp.description, tp.class, tp.tag, COUNT(te.employee_id) AS employee_count, tg.name AS group_name FROM tb_position tp 
          LEFT JOIN tb_employee te ON tp.position_id = te.position_id AND te.deletedAt IS NULL
          LEFT JOIN tb_group tg ON tg.group_id = tp.group_id AND tg.deletedAt IS NULL
          WHERE 1 = 1 
            ${
              search
                ? `AND (tp.name LIKE '%${search}%' OR tp.tag LIKE '%${search}%')`
                : ""
            }
            ${group_id_filter ? `AND tg.group_id = 2` : ""}
          GROUP BY position_id
          LIMIT ${limit} OFFSET ${offset};
        
        `,
        { type: QueryTypes.SELECT }
      );
    }
  }

  Position.init(
    {
      position_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      class: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: tb_name,
      timestamps: true,
      paranoid: true,

      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "Position", // We need to choose the model name
    }
  );

  Position.associate = function (models) {
    // associations can be defined here
    Position.hasMany(models.Employee, {
      as: "employee",
      foreignKey: "position_id",
    });
    Position.belongsTo(models.Group, {
      as: "group",
      foreignKey: "group_id",
    });
    Position.belongsTo(models.Position, {
      as: "parent",
      foreignKey: "parent_id",
    });
    Position.hasMany(models.Position, {
      as: "child",
      foreignKey: "parent_id",
    });

    return Position;
  };

  return Position;
};
