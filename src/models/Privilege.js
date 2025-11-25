module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_privilege`;
  class Privilege extends Model {}

  Privilege.init(
    {
      privilege_code: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      privilege_type_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "Privilege", // We need to choose the model name
    }
  );

  Privilege.associate = function (models) {
    // associations can be defined here
    Privilege.hasMany(models.PrivilegePrivilegeGroup, {
      foreignKey: "privilege_code",
    });
    Privilege.belongsToMany(models.PrivilegeGroup, {
      through: models.PrivilegePrivilegeGroup,
      foreignKey: "privilege_code",
    });
  };

  return Privilege;
};
