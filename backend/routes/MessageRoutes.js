const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const { upload, uploadToS3 } = require("../utils/multer");
const {
  fetchMessages,
  deleteMessages,
  updateMessage,
  sendMessage,
  accessAttachment,
} = require("../controllers/MessageController");

/*   Base route: /api/message   */
router.post("/", authorizeUser, upload.single("attachment"), sendMessage);
router.post(
  "/upload-to-s3",
  authorizeUser,
  uploadToS3.single("attachment"),
  sendMessage
);
router.get("/:chatId", authorizeUser, fetchMessages);

router.put(
  "/update",
  authorizeUser,
  upload.single("attachment"),
  updateMessage
);
router.put(
  "/update-in-s3",
  authorizeUser,
  uploadToS3.single("attachment"),
  updateMessage
);
router.put("/delete", authorizeUser, deleteMessages);
router.get("/files/:filename", authorizeUser, accessAttachment);

module.exports = router;
