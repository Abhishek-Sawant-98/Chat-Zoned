const asyncHandler = require("express-async-handler");
const ChatModel = require("../models/chatModel");
const cloudinary = require("../config/cloudinary");
const { deleteFile } = require("../utils/deleteFile");

const createOrRetrieveChat = asyncHandler(async (req, res) => {
  const receiverUserId = req.body?.userId;
  const loggedInUserId = req.user?._id;

  if (!receiverUserId) {
    res.status(400);
    throw new Error("UserId not sent in request body");
  }

  // First check if a chat exists with the above users
  const existingChats = await ChatModel.find({
    $and: [
      { isGroupChat: false },
      { users: { $elemMatch: { $eq: receiverUserId } } },
      { users: { $elemMatch: { $eq: loggedInUserId } } },
    ],
  })
    .populate("users", "-password -notifications")
    .populate({
      path: "lastMessage",
      model: "Message",
      populate: {
        path: "sender",
        model: "User",
        select: "name email profilePic",
      },
    });

  if (existingChats.length > 0) {
    res.status(200).json(existingChats[0]);
  } else {
    // If it doesn't exist, then create a new chat
    const createdChat = await ChatModel.create({
      chatName: "reciever",
      isGroupChat: false,
      users: [receiverUserId, loggedInUserId],
    });

    const populatedChat = await ChatModel.findById(createdChat._id).populate({
      path: "users",
      model: "User",
      select: "-password -notifications",
    });
    res.status(201).json(populatedChat);
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user?._id;

  // Fetch all the chats for the currently logged-in user
  const chats = await ChatModel.find({
    users: { $elemMatch: { $eq: loggedInUserId } },
  })
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications")
    .populate({
      path: "lastMessage",
      model: "Message",
      // Nested populate in mongoose
      populate: {
        path: "sender",
        model: "User",
        select: "name email profilePic",
      },
    })
    .sort({ updatedAt: "desc" }); // (latest to oldest)

  res.status(200).json(chats);
});

const createGroupChat = asyncHandler(async (req, res) => {
  const displayPic = req.file;
  let { chatName, users } = req.body;
  const loggedInUserId = req.user?._id;

  if (!chatName || !users) {
    res.status(400);
    throw new Error("Please Enter All the Fields");
  }

  users = JSON.parse(users); // Since users array was stringified before sending it

  if (users.length < 2) {
    res.status(400);
    throw new Error("Minimum of 3 Users Needed to Create a Group");
  }
  // Since group includes currently logged-in user too
  users = [loggedInUserId, ...users];

  let displayPicData;
  // If display pic not selected, then set it as the default one
  if (!displayPic) {
    displayPicData = {
      cloudinary_id: "",
      chatDisplayPic:
        "https://res.cloudinary.com/abhi-sawant/image/upload/v1654599490/group_mbuvht.png",
    };
  } else {
    const uploadResponse = await cloudinary.uploader.upload(displayPic.path);
    await deleteFile(displayPic.path); // Delete file from server after upload to cloudinary
    displayPicData = {
      cloudinary_id: uploadResponse.public_id,
      chatDisplayPic: uploadResponse.secure_url,
    };
  }

  const createdGroup = await ChatModel.create({
    chatName,
    users,
    isGroupChat: true,
    groupAdmins: [loggedInUserId],
    ...displayPicData,
  });

  const populatedGroup = await ChatModel.findById(createdGroup._id)
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  res.status(201).json(populatedGroup);
});

const deleteGroupDP = asyncHandler(async (req, res) => {
  const { currentDP, cloudinary_id, chatId } = req.body;

  if (!currentDP || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for deleting group dp");
  }

  // Delete the existing dp only if it's not the default dp
  if (currentDP.endsWith("group_mbuvht.png")) {
    res.status(400);
    throw new Error("Cannot Delete the Default Group DP");
  }

  await cloudinary.uploader.destroy(cloudinary_id);

  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      cloudinary_id: "",
      chatDisplayPic:
        "https://res.cloudinary.com/abhi-sawant/image/upload/v1654599490/group_mbuvht.png",
    },
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(updatedGroup);
});

const updateGroupDP = asyncHandler(async (req, res) => {
  const displayPic = req.file;
  const { currentDP, cloudinary_id, chatId } = req.body;

  if (!displayPic || !currentDP || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for update group dp");
  }

  // Delete the existing dp only if it's not the default dp
  if (!currentDP.endsWith("group_mbuvht.png")) {
    await cloudinary.uploader.destroy(cloudinary_id);
  }
  const uploadResponse = await cloudinary.uploader.upload(displayPic.path);
  await deleteFile(displayPic.path); // Delete file from server after upload to cloudinary

  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      cloudinary_id: uploadResponse.public_id,
      chatDisplayPic: uploadResponse.secure_url,
    },
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group Not Found");
  }

  res.status(200).json(updatedGroup);
});

const updateGroupName = asyncHandler(async (req, res) => {
  const { groupName, chatId } = req.body;

  if (!groupName || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for update group name");
  }

  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      chatName: groupName,
    },
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group Not Found");
  }

  res.status(200).json(updatedGroup);
});

const removeUserFromGroup = asyncHandler(async (req, res) => {
  const { userToBeRemoved, isGroupAdmin, chatId } = req.body;

  if (!userToBeRemoved || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for remove user from group");
  }
  const updateCriteria = isGroupAdmin
    ? {
        $pull: { users: userToBeRemoved, groupAdmins: userToBeRemoved },
      }
    : { $pull: { users: userToBeRemoved } };

  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    updateCriteria,
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(updatedGroup);
});

const addUsersToGroup = asyncHandler(async (req, res) => {
  let { usersToBeAdded, chatId } = req.body;
  usersToBeAdded = JSON.parse(usersToBeAdded);

  if (!usersToBeAdded?.length || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for adding user/s to group");
  }
  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      $push: { users: { $each: usersToBeAdded } },
    },
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(updatedGroup);
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("Invalid chatId for Deleting Group");
  }
  const deletedGroup = await ChatModel.findByIdAndDelete(chatId)
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  if (!deletedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(deletedGroup);
});

const makeGroupAdmin = asyncHandler(async (req, res) => {
  let { userId, chatId } = req.body;

  if (!userId || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for making group admin");
  }

  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      $push: { groupAdmins: userId },
    },
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(updatedGroup);
});

const dismissAsAdmin = asyncHandler(async (req, res) => {
  let { userId, chatId } = req.body;

  if (!userId || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for dismissing group admin");
  }

  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      $pull: { groupAdmins: userId },
    },
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmins", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group Not Found");
  }

  res.status(200).json(updatedGroup);
});

module.exports = {
  createOrRetrieveChat,
  fetchChats,
  createGroupChat,
  deleteGroupDP,
  updateGroupDP,
  updateGroupName,
  removeUserFromGroup,
  addUsersToGroup,
  makeGroupAdmin,
  dismissAsAdmin,
  deleteGroupChat,
};
