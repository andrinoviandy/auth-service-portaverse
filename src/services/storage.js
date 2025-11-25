/**
 * Storage function with multer and aws
 *
 */

const path = require("path");

const crypto = require("crypto");

const aws = require("aws-sdk");
const multer = require("multer");
const s3Storage = require("multer-sharp-s3");
const spacesEndpoint = new aws.Endpoint(process.env.DO_SPACES_ENDPOINT || "");

// configuration
aws.config.update({
  secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY || "",
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID || "",
  endpoint: spacesEndpoint,
  signatureVersion: "v4",
  region: process.env.DO_SPACES_REGION || "",
});

// init S3 class
const s3 = new aws.S3();

/**
 * file filter
 *
 * @param req Request
 * @param file File
 * @param cb Callback
 */
const filter = (req, file, cb) => {
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
    ".docx",
    ".doc",
    ".xlsx",
    ".csv",
    ".txt",
    ".mp4",
  ];
  const imageExtensions = [".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname);
  const size = file.size;
  const isImage = imageExtensions.includes(ext.toLowerCase());
  if (allowedExtensions.includes(ext.toLowerCase())) {
    if (isImage) {
      if (size > 5e6) {
        const err = "Image exceeds 5 mb";
        req.fileValidationError = err;
        cb(new Error(err), false);
      }
    } else {
      if (size > 1e8) {
        const err = "File exceeds 100 mb";
        req.fileValidationError = err;
        cb(new Error(err), false);
      }
    }
    cb(null, true);
  } else {
    const err = "File extension is not allowed!";
    req.fileValidationError = err;
    cb(new Error(err), false);
  }
};

/**
 * Generate randomize key
 *
 * @param req Request
 * @param file File
 * @param cb Callback
 */
const generateKey = (req, file, cb) => {
  let path = "files/";
  const subPath = req.body.path;

  if (subPath && subPath !== "") {
    path = path + subPath.trim() + "/";
  }

  crypto.pseudoRandomBytes(16, (err, raw) => {
    cb(err, err ? undefined : path + raw.toString("hex"));
  });
};

// storage settings
const storage = s3Storage({
  Key: generateKey,
  s3: s3,
  Bucket: process.env.DO_SPACES_BUCKET,
  multiple: true,
  ACL: "private",
});

/**
 * Upload file
 */
const uploadFile = multer({
  storage: storage,
  fileFilter: filter,
}).single("file");

/**
 * Delete file(s) on the bucket
 *
 * @param keys Array or single key
 */
const deleteObject = (keys) => {
  if (Array.isArray(keys)) {
    const objects = [];

    keys.forEach((key) => {
      objects.push({
        Key: key,
      });
    });

    s3.deleteObjects(
      {
        Bucket: process.env.DO_SPACES_BUCKET,
        Delete: {
          Objects: objects,
        },
      },
      (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          console.log("DO Spaces multiple deletion: ", data);
        }
      }
    );
  } else {
    s3.deleteObject(
      {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: key,
      },
      (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          console.log("DO Spaces single deletion: ", data);
        }
      }
    );
  }
};

// MIDDLEWARE MULTIPART
const multerMiddleware = require("multer");
const upload = multerMiddleware({
  storage: multerMiddleware.memoryStorage(),
});

// MIDDLEWARE EXCEL
const multerExcel = require("multer");
const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};
const excelStorage = multerExcel.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-kmap-${file.originalname}`);
  },
});
const uploadExcelFile = multerExcel({
  storage: excelStorage,
  fileFilter: excelFilter,
});

/**
 * Retrieve file
 */

const retrieveFile = (key) => {
  try {
    const url = s3.getSignedUrl("getObject", {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: key,
      // Key: "files/" + key,
    });
    return { success: true, url };
  } catch (error) {
    return { success: false, error };
  }
};

module.exports = {
  uploadFile,
  deleteObject,
  storage,
  retrieveFile,
  uploadMiddleware: upload.any(),
  uploadExcelFile: uploadExcelFile.single("file"),
};
