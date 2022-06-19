const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const upload = require("../utils/multer");
const {
  registerUser,
  authenticateUser,
  fetchUsers,
  updateUserName,
  updateUserPassword,
  updateUserProfilePic,
  deleteUserProfilePic,
  addNotification,
  deleteNotification,
  // fetchFile,
} = require("../controllers/UserController");

/*   Base route: /api/user   */
router.post("/register", upload.single("profilePic"), registerUser);
router.post("/login", authenticateUser);
router.get("/", authorizeUser, fetchUsers);
router.put("/update/name", authorizeUser, updateUserName);
router.put("/update/password", authorizeUser, updateUserPassword);
router.put(
  "/update/profile-pic",
  authorizeUser,
  upload.single("profilePic"),
  updateUserProfilePic
);
router.put("/delete/profile-pic", authorizeUser, deleteUserProfilePic);
router.put("/add/notification", authorizeUser, addNotification);
router.put("/delete/notification", authorizeUser, deleteNotification);

// router.get("/:file", fetchFile);

module.exports = router;
