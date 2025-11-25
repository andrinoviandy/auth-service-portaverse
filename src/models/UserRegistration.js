module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_user_registration`;

  class UserRegistration extends Model {}

  UserRegistration.init(
    {
      user_registration_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      employee_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      employee_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
        defaultValue: "DRAFT",
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
      success_user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      success_employee_id: {
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

      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "UserRegistration", // We need to choose the model name
    }
  );

  UserRegistration.associate = function (models) {
    // associations can be defined here

    // Example associations (sesuaikan dengan kebutuhan):
    // UserRegistration.belongsTo(models.User, {
    //   as: "success_user",
    //   foreignKey: "success_user_id",
    // });

    // UserRegistration.belongsTo(models.Employee, {
    //   as: "success_employee",
    //   foreignKey: "success_employee_id",
    // });

    // UserRegistration.belongsTo(models.User, {
    //   as: "rejector",
    //   foreignKey: "rejected_by",
    // });

    // UserRegistration.belongsTo(models.User, {
    //   as: "acceptor",
    //   foreignKey: "accepted_by",
    // });

    // UserRegistration.belongsTo(models.File, {
    //   as: "profile_picture",
    //   foreignKey: "profile_picture_file_id",
    // });

    // UserRegistration.belongsTo(models.File, {
    //   as: "id_card",
    //   foreignKey: "id_card_file_id",
    // });

    // UserRegistration.belongsTo(models.File, {
    //   as: "sk_file",
    //   foreignKey: "sk_file_id",
    // });

    return UserRegistration;
  };

  return UserRegistration;
};
