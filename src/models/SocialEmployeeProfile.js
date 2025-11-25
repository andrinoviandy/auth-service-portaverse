"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SocialEmployeeProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SocialEmployeeProfile.belongsTo(models.Employee, {
        foreignKey: "employee_id",
      });

      SocialEmployeeProfile.belongsTo(models.File, {
        as: "profile_picture",
        foreignKey: "avatar",
      });
    }
  }
  SocialEmployeeProfile.init(
    {
      social_employee_profile_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      background_id: DataTypes.INTEGER,
      avatar: DataTypes.INTEGER,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      additional_name: DataTypes.STRING,
      headline: DataTypes.STRING,
      about: DataTypes.STRING,
      location_country: DataTypes.STRING,
      location_city: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "SocialEmployeeProfile",
      tableName: "tb_social_employee_profile",
    }
  );
  return SocialEmployeeProfile;
};
