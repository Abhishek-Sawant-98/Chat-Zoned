const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const upload = require("../utils/multer");
const {
  fetchMessages,
  deleteMessage,
  updateMessage,
  sendMessage,
} = require("../controllers/MessageController");

router.post("/", authorizeUser, upload.single("attachment"), sendMessage);
router.get("/:chatId", authorizeUser, fetchMessages);

router.put("/update", authorizeUser, updateMessage);
router.put("/delete", authorizeUser, deleteMessage);

module.exports = router;
