const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const {
  fetchMessages,
  deleteMessage,
  updateMessage,
  sendMessage,
} = require("../controllers/MessageController");

router
  .route("/")
  .post(authorizeUser, sendMessage)
  .get(authorizeUser, fetchMessages);

router.put("/update", authorizeUser, updateMessage);
router.put("/delete", authorizeUser, deleteMessage);

module.exports = router;
