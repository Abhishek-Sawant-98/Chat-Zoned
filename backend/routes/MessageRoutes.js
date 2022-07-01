const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const upload = require("../utils/multer");
const {
  fetchMessages,
  deleteMessages,
  updateMessage,
  sendMessage,
} = require("../controllers/MessageController");

/*   Base route: /api/message   */
router.post("/", authorizeUser, upload.single("attachment"), sendMessage);
router.get("/:chatId", authorizeUser, fetchMessages);

router.put(
  "/update",
  authorizeUser,
  upload.single("attachment"),
  updateMessage
);
router.put("/delete", authorizeUser, deleteMessages);

module.exports = router;
