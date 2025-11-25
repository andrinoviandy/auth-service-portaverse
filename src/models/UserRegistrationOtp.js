module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_user_registration_otp`;

  class UserRegistrationOtp extends Model {}

  UserRegistrationOtp.init(
    {
      user_registration_otp_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_registration_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      otp_code: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "hash",
      },
      expired_at: {
        type: "TIMESTAMP",
        allowNull: false,
      },
      sent_at: {
        type: "TIMESTAMP",
        allowNull: false,
      },
      verification_status: {
        type: DataTypes.ENUM("PENDING", "FAILED", "SUCCESS"),
        allowNull: true,
        defaultValue: "PENDING",
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

      sequelize,
      modelName: "UserRegistrationOtp",
    }
  );

  UserRegistrationOtp.associate = function (models) {
    // associations can be defined here

    UserRegistrationOtp.belongsTo(models.UserRegistration, {
      as: "user_registration",
      foreignKey: "user_registration_id",
    });

    return UserRegistrationOtp;
  };

  return UserRegistrationOtp;
};
