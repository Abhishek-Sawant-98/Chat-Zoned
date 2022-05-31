const asyncHandler = require("express-async-handler");
const UserModel = require("../models/UserModel");
const cloudinary = require("../config/cloudinary");
const deleteFile = require("../config/deleteFile");

const registerUser = asyncHandler(async (req, res) => {});

const authenticateUser = asyncHandler(async (req, res) => {});

const fetchUsers = asyncHandler(async (req, res) => {});

const updateUserName = asyncHandler(async (req, res) => {
  try {
    const { newUserName } = req.body;
    const loggedInUser = req.user?._id;

    if (!newUserName) {
      return res.status(400).send({
        message: "Invalid request params for update user name",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      loggedInUser,
      {
        name: newUserName,
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedUser) {
      res.status(404);
      throw new Error("Group not found");
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    console.log("Error in update group name route...");
    res.status(500).send(error.message);
  }
});

const updateUserProfilePic = asyncHandler(async (req, res) => {
  try {
    const newProfilePic = req.file;
    const { currentProfilePic, cloudinary_id } = req.body;
    const loggedInUser = req.user?._id;

    if (!newProfilePic || !currentProfilePic) {
      return res.status(400).send({
        message: "Invalid request params for update user profile pic",
      });
    }

    // Delete the existing profile pic only if it's not the default one
    if (!currentProfilePic.endsWith("user_dqzjdz.png")) {
      await cloudinary.uploader.destroy(cloudinary_id);
    }
    const uploadResponse = await cloudinary.uploader.upload(newProfilePic.path);
    await deleteFile(newProfilePic.path); // Delete file from server after upload to cloudinary

    const updatedUser = await UserModel.findByIdAndUpdate(
      loggedInUser,
      {
        cloudinary_id: uploadResponse.public_id,
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    console.log("Error in update user profile pic route...");
    res.status(500).send(error.message);
  }
});

const deleteUserProfilePic = asyncHandler(async (req, res) => {
  try {
    const { currentProfilePic, cloudinary_id } = req.body;
    const loggedInUser = req.user?._id;

    if (!currentProfilePic) {
      return res.status(400).send({
        message: "Invalid request params for deleting user profile pic",
      });
    }

    // Delete the existing profile pic only if it's not the default one
    if (currentProfilePic.endsWith("user_dqzjdz.png")) {
      return res
        .status(400)
        .send({ message: "Cannot delete the default user profile pic" });
    }

    await cloudinary.uploader.destroy(cloudinary_id);

    const updatedUser = await UserModel.findByIdAndUpdate(
      loggedInUser,
      {
        cloudinary_id: "",
        profilePic:
          "https://res.cloudinary.com/abhi-sawant/image/upload/v1653670527/user_dqzjdz.png",
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    console.log("Error in delete user profile pic route...");
    res.status(500).send(error.message);
  }
});

module.exports = {
  registerUser,
  authenticateUser,
  fetchUsers,
  updateUserName,
  updateUserProfilePic,
  deleteUserProfilePic,
};
