module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_notification_token`;
  class NotificationToken extends Model {}

  NotificationToken.init(
    {
      notification_token_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      employee_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: tb_name,
      timestamps: false,

      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "NotificationToken", // We need to choose the model name
    }
  );

  NotificationToken.associate = function (models) {
    // associations can be defined here
    // NotificationToken.hasOne(models.Employee, {
    //   as: "employee",
    //   foreignKey: "notification_token_id",
    // });
    // return NotificationToken;
  };

  return NotificationToken;
};
