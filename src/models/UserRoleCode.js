module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_user_role_code`;
  class UserRoleCode extends Model {}

  UserRoleCode.init(
    {
      user_role_code_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      role_code: {
        type: DataTypes.STRING(4),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: "TIMESTAMP",
        allowNull: false,
      },
      updatedAt: {
        type: "TIMESTAMP",
        allowNull: false,
      },
      deletedAt: {
        type: "TIMESTAMP",
        allowNull: true,
      },
    },
    {
      tableName: tb_name,
      timestamps: true,
      paranoid: true,

      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "UserRoleCode", // We need to choose the model name
    }
  );

  UserRoleCode.associate = function (models) {
    // associations can be defined here
    UserRoleCode.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
    });
  };

  return UserRoleCode;
};
