module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_user_login`;
  class UserLogin extends Model {}

  UserLogin.init(
    {
      user_login_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      device: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      browser: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: tb_name,
      timestamps: false,

      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "UserLogin", // We need to choose the model name
    }
  );

  UserLogin.associate = function (models) {
    // associations can be defined here

    return UserLogin;
  };

  return UserLogin;
};
