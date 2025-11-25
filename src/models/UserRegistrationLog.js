module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_user_registration_log`;

  class UserRegistrationLog extends Model {}

  UserRegistrationLog.init(
    {
      user_registration_log_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_registration_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employee_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      employee_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      work_unit: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      employee_status: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      superior_employee_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      superior_employee_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      superior_position_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      firebase_account_uid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("DRAFT", "SUBMITTED", "ACCEPTED", "REJECTED"),
        allowNull: true,
      },
      last_step: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
      },
      profile_picture_file_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      id_card_file_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      sk_file_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "VIEW ONLY",
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "VIEW ONLY",
      },
      birthplace: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "VIEW ONLY",
      },
      created_user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      created_employee_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      rejected_at: {
        type: "TIMESTAMP",
        allowNull: true,
      },
      rejected_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      rejection_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      accepted_at: {
        type: "TIMESTAMP",
        allowNull: true,
      },
      accepted_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      submitted_at: {
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
      modelName: "UserRegistrationLog",
    }
  );

  UserRegistrationLog.associate = function (models) {
    // associations can be defined here

    UserRegistrationLog.belongsTo(models.UserRegistration, {
      as: "user_registration",
      foreignKey: "user_registration_id",
    });

    // UserRegistrationLog.belongsTo(models.User, {
    //   as: "created_user",
    //   foreignKey: "created_user_id",
    // });

    // UserRegistrationLog.belongsTo(models.Employee, {
    //   as: "created_employee",
    //   foreignKey: "created_employee_id",
    // });

    // UserRegistrationLog.belongsTo(models.User, {
    //   as: "rejector",
    //   foreignKey: "rejected_by",
    // });

    // UserRegistrationLog.belongsTo(models.User, {
    //   as: "acceptor",
    //   foreignKey: "accepted_by",
    // });

    return UserRegistrationLog;
  };

  return UserRegistrationLog;
};
