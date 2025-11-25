module.exports = (sequelize, DataTypes, Model) => {
  const tb_name = "tb_group_master";
  class GroupMaster extends Model {}

  GroupMaster.init(
    {
      group_master_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      org_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      org_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      costcenter: {
        type: DataTypes.STRING(100),
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
      chief: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      organization_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      last_updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      chief_employee_position_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: tb_name,
      timestamps: true,
      paranoid: true,

      sequelize,
      modelName: "GroupMaster",
    }
  );

  GroupMaster.associate = function (models) {
    // associations can be defined here
    GroupMaster.belongsTo(models.EmployeePositionMasterSync, {
        foreignKey: "chief_employee_position_id",
        targetKey: "employee_position_master_sync_id",
        as: "group_master"
      });
  };

  return GroupMaster;
};
