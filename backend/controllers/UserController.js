const asyncHandler = require("express-async-handler");
const UserModel = require("../models/UserModel");
const cloudinary = require("../config/cloudinary");
const deleteFile = require("../config/deleteFile");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const profilePic = req.file;
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({
      message: "Please enter all the user fields",
    });
  }
  // What if profilePic is undefined (user didn't select profile pic)

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    let uploadResponse, profilePicDetails;
    // Save only the selected profile pic to cloudinary (don't save if not selected by user)
    if (profilePic) {
      uploadResponse = await cloudinary.uploader.upload(profilePic.path);
      await deleteFile(profilePic.path); // Delete file from server after upload to cloudinary

      profilePicDetails = {
        cloudinary_id: uploadResponse.public_id,
        profilePic: uploadResponse.secure_url,
      };
    }

    const newUserDetails = profilePicDetails
      ? {
          name,
          email,
          password,
          ...profilePicDetails,
        }
      : { name, email, password };

    const createdUser = await UserModel.create(newUserDetails);

    if (!createdUser) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(201).send({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      cloudinary_id: createdUser.cloudinary_id,
      profilePic: createdUser.profilePic,
      token: generateToken(createdUser._id),
    });
  } catch (error) {
    console.log("Error in register user route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const authenticateUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Invalid request params for user login" });
  }

  try {
    // Check if a user with entered email exists
    const user = await UserModel.findOne({ email });

    // Also check if entered password matches the password
    // stored in returned user
    if (user?.matchPassword(password)) {
      res.status(200).send({
        _id: user._id,
        name: user.name,
        email: user.email,
        cloudinary_id: user.cloudinary_id,
        profilePic: user.profilePic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    console.log("Error in user login route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const fetchUsers = asyncHandler(async (req, res) => {
  const loggedInUser = req.user?._id;
  //    /api/user?search=abc
  const searchQuery = req.query?.search || "";
  const searchFilter = {
    $or: [
      { name: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
    ],
  };

  try {
    // Find all users excluding loggedInUser, based on the searchFilter
    const users = await UserModel.find(searchFilter).find({
      _id: { $ne: loggedInUser },
    });

    res.status(200).send(users);
  } catch (error) {
    console.log("Error in fetch users route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const updateUserName = asyncHandler(async (req, res) => {
  const { newUserName } = req.body;
  const loggedInUser = req.user?._id;

  if (!newUserName) {
    return res.status(400).send({
      message: "Invalid request params for update user name",
    });
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      loggedInUser,
      {
        name: newUserName,
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    console.log("Error in update user name route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const updateUserProfilePic = asyncHandler(async (req, res) => {
  const newProfilePic = req.file;
  const { currentProfilePic, cloudinary_id } = req.body;
  const loggedInUser = req.user?._id;

  if (!newProfilePic || !currentProfilePic) {
    return res.status(400).send({
      message: "Invalid request params for update user profile pic",
    });
  }

  try {
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
    res.status(500);
    throw new Error(error.message);
  }
});

const deleteUserProfilePic = asyncHandler(async (req, res) => {
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

  try {
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
    res.status(500);
    throw new Error(error.message);
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
