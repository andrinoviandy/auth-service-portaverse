module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_privilege_role`;
  class PrivilegeRole extends Model {}

  PrivilegeRole.init(
    {
      privilege_role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_code: {
        type: DataTypes.STRING(10),
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
      modelName: "PrivilegeRole", // We need to choose the model name
    }
  );

  PrivilegeRole.associate = function (models) {
    // associations can be defined here
    PrivilegeRole.belongsTo(models.Privilege, {
      foreignKey: "privilege_code",
    });
  };

  return PrivilegeRole;
};
