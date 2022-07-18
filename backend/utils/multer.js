import multer from "multer";
import multerS3 from "multer-s3";
import { s3, s3_bucket } from "../config/aws_S3.js";

// Generating a unique file name
const generateUniqueFileName = (file) => {
  return (
    (Date.now() + Math.random()).toString().replace(".", "") +
    "---" +
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
    key: function (req, file, cb) {
      if (file) {
        cb(null, generateUniqueFileName(file));
      }
    },
  }),
});

export { upload, uploadToS3 };
