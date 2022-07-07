const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3, s3_bucket } = require("../config/aws_S3");

// Generating a unique file name
const generateUniqueFileName = (file) => {
  return (
    (Date.now() + Math.random()).toString().replace(".", "") +
    "--" +
    file.originalname
  );
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file) {
        cb(null, "backend/messageFiles");
      }
    },
    filename: (req, file, cb) => {
      if (file) {
        cb(null, generateUniqueFileName(file));
      }
    },
  }),
});

const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: s3_bucket,
    key: (req, file, cb) => {
      if (file) {
        console.log("In uploadToS3 key method", file);
        cb(null, generateUniqueFileName(file));
      }
    },
  }),
});

module.exports = { upload, uploadToS3 };
