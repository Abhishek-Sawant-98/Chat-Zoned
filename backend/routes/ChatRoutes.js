const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const upload = require("../utils/multer");
const {
  createOrRetrieveChat,
  fetchChats,
  createGroupChat,
  updateGroupDP,
  updateGroupName,
  removeUserFromGroup,
  addUsersToGroup,
  deleteGroupChat,
  deleteGroupDP,
} = require("../controllers/ChatController");

/*   Base route: /api/chat   */
router
  .route("/")
  .post(authorizeUser, createOrRetrieveChat)
  .get(authorizeUser, fetchChats);

router.post(
  "/group",
  authorizeUser,
  upload.single("displayPic"),
  createGroupChat
);
router.put("/group/delete-dp", authorizeUser, deleteGroupDP);
router.put(
  "/group/update-dp",
  authorizeUser,
  upload.single("displayPic"),
  updateGroupDP
);
router.put("/group/update-name", authorizeUser, updateGroupName);
router.put("/group/remove", authorizeUser, removeUserFromGroup);
router.put("/group/add", authorizeUser, addUsersToGroup);
router.put("/group/delete", authorizeUser, deleteGroupChat);

module.exports = router;
