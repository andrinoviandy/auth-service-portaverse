module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_privilege_group`;
  class PrivilegeGroup extends Model {}

  PrivilegeGroup.init(
    {
      privilege_group_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      modelName: "PrivilegeGroup", // We need to choose the model name
    }
  );

  PrivilegeGroup.associate = function (models) {
    // associations can be defined here
    PrivilegeGroup.hasMany(models.PrivilegePrivilegeGroup, {
      foreignKey: "privilege_group_id",
    });
    PrivilegeGroup.belongsToMany(models.Privilege, {
      through: models.PrivilegePrivilegeGroup,
      foreignKey: "privilege_group_id",
    });
  };

  return PrivilegeGroup;
};
