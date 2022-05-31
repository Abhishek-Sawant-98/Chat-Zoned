const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "backend/messageFiles");
    },
    filename: (req, file, cb) => {
      // Generating a unique file name
      cb(
        null,
        (Date.now() + Math.random()).toString().replace(".", "") +
          "--" +
          file.originalname
      );
    },
  }),
});

module.exports = upload;
