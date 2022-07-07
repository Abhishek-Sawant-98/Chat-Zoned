const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const { upload } = require("../utils/multer");
const {
  createOrRetrieveChat,
  fetchChats,
  createGroupChat,
  updateGroupDP,
  updateGroupName,
  removeUserFromGroup,
  addUsersToGroup,
  deleteGroupChat,
  makeGroupAdmin,
  dismissAsAdmin,
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
router.post("/group/add", authorizeUser, addUsersToGroup);
router.put("/group/delete", authorizeUser, deleteGroupChat);
router.post("/group/make-admin", authorizeUser, makeGroupAdmin);
router.put("/group/dismiss-admin", authorizeUser, dismissAsAdmin);

module.exports = router;
