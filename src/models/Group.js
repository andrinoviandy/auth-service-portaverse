module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = "tb_group";
  class Group extends Model {}

  Group.init(
    {
      group_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      head_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      group_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deletedAt: {
        type: "TIMESTAMP",
        allowNull: true,
      },
      createdAt: {
        type: "TIMESTAMP",
        allowNull: false,
      },
      updatedAt: {
        type: "TIMESTAMP",
        allowNull: false,
      },
    },
    {
      tableName: tb_name,
      timestamps: true,
      paranoid: true,

      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "Group", // We need to choose the model name
    }
  );

  Group.associate = function (models) {
    // associations can be defined here
    Group.belongsTo(models.Employee, {
      foreignKey: "head_id",
    });
  };

  return Group;
};
