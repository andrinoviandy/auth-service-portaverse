module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = "tb_employee";

  class Employee extends Model {
    static attrFullname(field = "") {
      return [
        sequelize.fn(
          "CONCAT",
          sequelize.col(`${field ? field + "." : ""}firstname`),
          " ",
          sequelize.col(`${field ? field + "." : ""}middlename`),
          " ",
          sequelize.col(`${field ? field + "." : ""}lastname`)
        ),
        "name",
      ];
    }
  }

  Employee.init(
    {
      employee_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      file_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      coach_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      middlename: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      job_class_level: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      employee_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      old_employee_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      position_id_backup_8_nov: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status_worker: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      class: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      period: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      jabatan_id: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      stat_jabatan: {
        type: DataTypes.STRING(5),
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
      penugasan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cost_center: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      active_status: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      no_peg: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      gelar_akademik: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      learning_wallet: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      learning_wallet_is_freeze: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      position_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      kj_definitif: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "FK to tb_user.user_id",
      },
      werks_new: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pernr: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      company_id: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      wallet: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      old_job_class_level: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      employee_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "organik, etc",
      },
      corporate_email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      archived_at: {
        type: "TIMESTAMP",
        allowNull: true,
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
      modelName: "Employee", // We need to choose the model name
    }
  );

  Employee.associate = function (models) {
    // associations can be defined here
    Employee.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
    });
    Employee.belongsTo(models.Group, {
      as: "group",
      foreignKey: "group_id",
    });
    Employee.belongsTo(models.EmployeePositionMasterSync, {
      as: "employee_position_master_sync",
      foreignKey: "employee_number",
      targetKey: "employee_number",
    });
    Employee.belongsTo(models.File, {
      as: "profile_picture",
      foreignKey: "file_id",
    });
    Employee.belongsTo(models.Employee, {
      as: "manager",
      foreignKey: "manager_id",
    });
    Employee.belongsTo(models.Employee, {
      as: "coach",
      foreignKey: "coach_id",
    });
    Employee.hasOne(models.SocialEmployeeProfile, {
      as: "social_employee_profile",
      foreignKey: "employee_id",
    });
    Employee.belongsTo(models.Position, {
      as: "position",
      foreignKey: "position_id",
    });

    return Employee;
  };

  return Employee;
};
