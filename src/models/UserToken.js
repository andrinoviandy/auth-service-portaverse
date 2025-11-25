module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_user_token`;

  class UserToken extends Model {}

  UserToken.init(
    {
      user_token_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expired_token: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: tb_name,
      timestamps: false,

      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "UserToken", // We need to choose the model name
    }
  );

  UserToken.associate = function (models) {};

  return UserToken;
};
