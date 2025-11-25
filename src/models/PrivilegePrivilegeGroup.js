module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_privilege_privilege_group`;
  class PrivilegePrivilegeGroup extends Model {}

  PrivilegePrivilegeGroup.init(
    {
      privilege_privilege_group_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      privilege_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      privilege_code: {
        type: DataTypes.STRING(10),
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
      modelName: "PrivilegePrivilegeGroup", // We need to choose the model name
    }
  );

  PrivilegePrivilegeGroup.associate = function (models) {
    // associations can be defined here
    PrivilegePrivilegeGroup.belongsTo(models.Privilege, {
      foreignKey: "privilege_code",
    });
    PrivilegePrivilegeGroup.belongsTo(models.PrivilegeGroup, {
      foreignKey: "privilege_group_id",
    });
  };

  return PrivilegePrivilegeGroup;
};
