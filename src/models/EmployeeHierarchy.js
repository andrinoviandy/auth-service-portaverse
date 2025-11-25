module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = "tb_employee_hierarchy";

  class EmployeeHierarchy extends Model { }

  EmployeeHierarchy.init(
    {
      employee_atasan_bawahan_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      NIPP_BARU: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      NIPP_ATS_BARU: {
        type: DataTypes.STRING(100),
        defaultValue: null,
      },
      NIPP: {
        type: DataTypes.STRING(100),
        defaultValue: null,
      },
      NIPP_ATS: {
        type: DataTypes.STRING(100),
        defaultValue: null,
      },
      NAMA: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      NAMA_JABATAN: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      NAMA_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      NAMA_JABATAN_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      KD_CABANG_SAP: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      SUB_AREA: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      KD_PEL: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      KD_CABANG_SAP_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      SUB_AREA_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      KD_PEL_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      LVL: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      COMPANY_CODE: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      COMPANY_CODE_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      EMAIL: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      EMAIL_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      PEMBUAT_LVL: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      KD_WIL: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      KD_DIV: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      KD_WIL_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      KD_DIV_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      SHORT: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      SUBDI: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      SHORT_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      SUBDI_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      INSTANSI: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      INSTANSI_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      R__: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      OBJID: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      FLAG_CHIEF: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      BEGDA: {
        type: DataTypes.STRING(50),
        defaultValue: null,
      },
      NAMA_GROUP: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
      NAMA_GROUP_ATS: {
        type: DataTypes.STRING(512),
        defaultValue: null,
      },
    },
    {
      tableName: tb_name,
      timestamps: true,

      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "EmployeeHierarchy", // We need to choose the model name
    }
  );

  EmployeeHierarchy.associate = function (models) {
    // associations can be defined here

    EmployeeHierarchy.belongsTo(models.Employee, {
      as: "employee_hierarchy",
      foreignKey: "NIPP_BARU",
      targetKey: "employee_number",
    });

    return EmployeeHierarchy;
  };

  return EmployeeHierarchy;
};
