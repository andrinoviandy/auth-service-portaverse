module.exports = (sequelize, DataTypes, Model, QueryTypes) => {
  const tb_name = `tb_file`;
  class File extends Model {}

  File.init(
    {
      file_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      link: {
        type: DataTypes.TEXT,
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
      modelName: "File", // We need to choose the model name
    }
  );

  File.associate = function (models) {
    // associations can be defined here
    File.hasOne(models.Employee, {
      foreignKey: "file_id",
    });

    return File;
  };

  /** should called after passing uploadFile middleware to create file rows in tb_file */
  /** @param fileFromUploadMiddleware is a req.file generated from multer */
  /** @param creator is a res.locals.uid from loggedin user */
  File.createFileAfterUpload = async (fileFromUploadMiddleware) => {
    let fileInsertDBResult = null;
    if (fileFromUploadMiddleware) {
      const data = {
        name: fileFromUploadMiddleware.originalname,
        link: fileFromUploadMiddleware.key,
      };

      fileInsertDBResult = await File.create(data);
    }
    return fileInsertDBResult;
  };

  return File;
};
