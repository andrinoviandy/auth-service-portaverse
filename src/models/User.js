module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_user`;
  class User extends Model {}

  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      role_code: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
      privilege_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_login: {
        type: "TIMESTAMP",
        allowNull: true,
      },
      last_privilege_change: {
        type: "TIMESTAMP",
        allowNull: true,
      },
      referal_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      referal_code: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      employee_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unit_induk: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      work_area: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      work_unit: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_sended_reset_password: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      has_update_password_nipp: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_external_user: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: "9999-12-31 23:59:59",
      },
      last_change_password_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_email_otp_required: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "1 = wajib OTP email, 0 = bypass",
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
      modelName: "User", // We need to choose the model name
    }
  );

  User.associate = function (models) {
    // associations can be defined here
    User.hasOne(models.Employee, {
      as: "employee",
      foreignKey: "user_id",
    });

    User.hasMany(models.UserRoleCode, {
      as: "role_codes",
      foreignKey: "user_id",
    });

    return User;
  };

  return User;
};
