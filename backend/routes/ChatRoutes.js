const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const upload = require("../config/multer");
const {
  createOrRetrieveChat,
  fetchChats,
  createGroupChat,
  updateGroupDP,
  updateGroupName,
  removeUserFromGroup,
  addUserToGroup,
  deleteGroupChat,
} = require("../controllers/ChatController");

router
  .route("/")
  .post(authorizeUser, createOrRetrieveChat)
  .get(authorizeUser, fetchChats);

router.post("/group", authorizeUser, createGroupChat);
router.put("/group/delete-dp", authorizeUser, updateGroupDP);
router.put(
  "/group/update-dp",
  authorizeUser,
  upload.single("displayPic"),
  updateGroupDP
);
router.put("/group/update-name", authorizeUser, updateGroupName);
router.put("/group/remove", authorizeUser, removeUserFromGroup);
router.put("/group/add", authorizeUser, addUserToGroup);
router.put("/group/delete", authorizeUser, deleteGroupChat);

module.exports = router;
