const router = require("express").Router();
const authorizeUser = require("../middleware/AuthMiddleware");
const {
  registerUser,
  authenticateUser,
  fetchUsers,
  updateUserName,
  updateUserProfilePic,
  deleteUserProfilePic,
} = require("../controllers/UserController");

router.post("/register", registerUser);
router.post("/login", authenticateUser);
router.get("/", authorizeUser, fetchUsers);
router.put("/update/name", authorizeUser, updateUserName);
router.put("/update/profile-pic", authorizeUser, updateUserProfilePic);
router.put("/delete/profile-pic", authorizeUser, deleteUserProfilePic);

module.exports = router;
