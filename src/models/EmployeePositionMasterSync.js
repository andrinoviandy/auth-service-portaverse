module.exports = (sequelize, DataTypes, Model) => {
  const tb_name = "tb_employee_position_master_sync";
  class EmployeePositionMasterSync extends Model {}

  EmployeePositionMasterSync.init(
    {
      employee_position_master_sync_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      position_master_variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      employee_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lakhar_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      job_sharing_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      last_updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      last_updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
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
      sk_file_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      mutation_type: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      job_history_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sk_date_issued: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      sk_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: tb_name,
      timestamps: true,
      paranoid: true,

      sequelize,
      modelName: "EmployeePositionMasterSync",
    }
  );

  EmployeePositionMasterSync.associate = function (models) {
    EmployeePositionMasterSync.belongsTo(models.Employee, {
      foreignKey: "employee_number",
      targetKey: "employee_number",
    });
    EmployeePositionMasterSync.hasOne(models.GroupMaster, {
      foreignKey: "chief_employee_position_id",
      sourceKey: "employee_position_master_sync_id",
      as: "group_master"
    });
  };

  return EmployeePositionMasterSync;
};