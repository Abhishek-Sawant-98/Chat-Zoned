import { Router } from "express";
import authorizeUser from "../middleware/AuthMiddleware.js";
import { upload } from "../utils/multer.js";
import {
  registerUser,
  authenticateUser,
  fetchUsers,
  updateUserName,
  updateUserPassword,
  updateUserProfilePic,
  deleteUserProfilePic,
  addNotification,
  deleteNotification,
} from "../controllers/UserController.js";

const router = Router();

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
router.post("/add/notification", authorizeUser, addNotification);
router.put("/delete/notification", authorizeUser, deleteNotification);

// router.get("/:file", fetchFile);

export default router;
