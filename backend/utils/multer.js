const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file) {
        cb(null, "backend/messageFiles");
      }
    },
    filename: (req, file, cb) => {
      // Generating a unique file name
      if (file) {
        cb(
          null,
          (Date.now() + Math.random()).toString().replace(".", "") +
            "--" +
            file.originalname
        );
      }
    },
  }),
});

module.exports = upload;
