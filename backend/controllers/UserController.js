const asyncHandler = require("express-async-handler");
const UserModel = require("../models/UserModel");
const cloudinary = require("../config/cloudinary");
const { deleteFile } = require("../utils/deleteFile");
const generateToken = require("../utils/generateToken");
const path = require("path");

// const fetchFile = asyncHandler(async (req, res) => {
//   const filepath = path.join(__dirname, "../messageFiles", fileUrl);
//   console.log("In get file request...", filepath);
//   res.status(200).sendFile(filepath);
// });

const registerUser = asyncHandler(async (req, res) => {
  // return res.sendFile(
  //   path.join(__dirname, "../messageFiles", req.file?.filename)
  // );
  const profilePic = req.file;
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All the User Fields");
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User Already Exists");
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

  // Using this condition as cloudinary_id and profilePic have default values, if not specified
  const newUserDetails = profilePicDetails
    ? {
        name,
        email,
        password,
        notifications: [],
        ...profilePicDetails,
      }
    : { name, email, password, notifications: [] };

  const createdUser = await UserModel.create(newUserDetails);

  if (!createdUser) {
    res.status(404);
    throw new Error("User Not Found");
  }

  res.status(201).json({
    _id: createdUser._id,
    name: createdUser.name,
    email: createdUser.email,
    notifications: createdUser.notifications,
    cloudinary_id: createdUser.cloudinary_id,
    profilePic: createdUser.profilePic,
    token: generateToken(createdUser._id),
  });
});

const authenticateUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Invalid request params for user login");
  }

  // Check if a user with entered email exists
  const user = await UserModel.findOne({ email }).populate({
    path: "notifications",
    model: "Message",
    populate: [
      {
        path: "sender",
        model: "User",
        select: "name email profilePic",
      },
      {
        path: "chat",
        model: "Chat",
        select: "-groupAdmin -cloudinary_id",
      },
    ],
  });
  // Also check if entered password matches the password
  // stored in returned user
  if (user?.matchPasswords(password)) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      notifications: user.notifications,
      cloudinary_id: user.cloudinary_id,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
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

  // Find all users excluding loggedInUser, based on the searchFilter
  const users = await UserModel.find(searchFilter)
    .find({
      _id: { $ne: loggedInUser },
    })
    .select("-password");

  res.status(200).json(users);
});

const updateUserName = asyncHandler(async (req, res) => {
  const { newUserName } = req.body;
  const loggedInUser = req.user?._id;

  if (!newUserName) {
    res.status(400);
    throw new Error("Invalid request params for update user name");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    loggedInUser,
    {
      name: newUserName,
    },
    { new: true }
  )
    .select("-password")
    .populate({
      path: "notifications",
      model: "Message",
      populate: [
        {
          path: "sender",
          model: "User",
          select: "name email profilePic",
        },
        {
          path: "chat",
          model: "Chat",
          select: "-groupAdmin -cloudinary_id",
        },
      ],
    });

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(updatedUser);
});

const updateUserProfilePic = asyncHandler(async (req, res) => {
  const newProfilePic = req.file;
  const { currentProfilePic, cloudinary_id } = req.body;
  const loggedInUser = req.user?._id;

  if (!newProfilePic || !currentProfilePic) {
    res.status(400);
    throw new Error("Invalid request params for update user profile pic");
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
  )
    .select("-password")
    .populate({
      path: "notifications",
      model: "Message",
      populate: [
        {
          path: "sender",
          model: "User",
          select: "name email profilePic",
        },
        {
          path: "chat",
          model: "Chat",
          select: "-groupAdmin -cloudinary_id",
        },
      ],
    });

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(updatedUser);
});

const deleteUserProfilePic = asyncHandler(async (req, res) => {
  const { currentProfilePic, cloudinary_id } = req.body;
  const loggedInUser = req.user?._id;

  if (!currentProfilePic) {
    res.status(400);
    throw new Error("Invalid request params for deleting user profile pic");
  }

  // Delete the existing profile pic only if it's not the default one
  if (currentProfilePic.endsWith("user_dqzjdz.png")) {
    res.status(400);
    throw new Error("Cannot delete the default user profile pic");
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
  )
    .select("-password")
    .populate({
      path: "notifications",
      model: "Message",
      populate: [
        {
          path: "sender",
          model: "User",
          select: "name email profilePic",
        },
        {
          path: "chat",
          model: "Chat",
          select: "-groupAdmin -cloudinary_id",
        },
      ],
    });

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(updatedUser);
});

const addNotification = asyncHandler(async (req, res) => {
  // Frontend logic
  // if(!selectedChat || selectedChat !== newMessage.chat) => add notification to array (if not present)
  const { notificationId } = req.body;
  const loggedInUser = req.user?._id;

  if (!notificationId) {
    res.status(400);
    throw new Error("Invalid notification id for adding a notification");
  }

  // First check if the notification already exists
  const existingNotification = await UserModel.findOne({
    $and: [
      { _id: loggedInUser },
      { notifications: { $elemMatch: notificationId } },
    ],
  });

  if (existingNotification) {
    res.status(400);
    throw new Error("Notification already exists");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    loggedInUser,
    { $push: { notifications: notificationId } },
    { new: true }
  )
    .select("-password")
    .populate({
      path: "notifications",
      model: "Message",
      populate: [
        {
          path: "sender",
          model: "User",
          select: "name email profilePic",
        },
        {
          path: "chat",
          model: "Chat",
          select: "-groupAdmin -cloudinary_id",
        },
      ],
    });

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found while adding notification");
  }

  res.status(200).json(updatedUser);
});

const deleteNotification = asyncHandler(async (req, res) => {
  // Frontend logic
  // if(selectedChat && selectedChat === newMessage.chat) => delete notification from array (if present)
  const { notificationId } = req.body;
  const loggedInUser = req.user?._id;

  if (!notificationId) {
    res.status(400);
    throw new Error("Invalid notification id for deleting a notification");
  }

  // First check if the notification exists or not
  const existingNotification = await UserModel.findOne({
    $and: [
      { _id: loggedInUser },
      { notifications: { $elemMatch: notificationId } },
    ],
  });

  if (!existingNotification) {
    res.status(400);
    throw new Error("Can't delete notification as it doesn't exist");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    loggedInUser,
    { $pull: { notifications: notificationId } },
    { new: true }
  )
    .select("-password")
    .populate({
      path: "notifications",
      model: "Message",
      populate: [
        {
          path: "sender",
          model: "User",
          select: "name email profilePic",
        },
        {
          path: "chat",
          model: "Chat",
          select: "-groupAdmin -cloudinary_id",
        },
      ],
    });

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found while deleting notification");
  }

  res.status(200).json(updatedUser);
});

module.exports = {
  registerUser,
  authenticateUser,
  fetchUsers,
  updateUserName,
  updateUserProfilePic,
  deleteUserProfilePic,
  addNotification,
  deleteNotification,
  // fetchFile,
};
