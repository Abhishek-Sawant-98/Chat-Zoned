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
      { users: { $elemMatch: receiverUserId } },
      { users: { $elemMatch: loggedInUserId } },
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
    users: { $elemMatch: loggedInUserId },
  })
    .populate("users", "-password -notifications")
    .populate("groupAdmin", "-password -notifications")
    .populate({
      path: "lastMessage",
      // Nested populate in mongoose
      populate: {
        path: "sender",
        select: "name email profilePic",
      },
    })
    .sort({ updatedAt: "desc" }); // (latest to oldest)

  res.status(200).json(chats);
});

const createGroupChat = asyncHandler(async (req, res) => {
  let { chatName, users } = req.body;
  const loggedInUserId = req.user?._id;

  if (!chatName || !users) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  users = JSON.parse(users); // Since users array was stringified before sending it

  if (users.length < 2) {
    res.status(400);
    throw new Error("Minimum of 3 users needed to form a group");
  }

  users.push(loggedInUserId); // Since group includes currently logged-in user too

  const createdGroup = await ChatModel.create({
    chatName,
    users,
    isGroupChat: true,
    groupAdmin: loggedInUserId,
    chatDisplayPic:
      "https://res.cloudinary.com/abhi-sawant/image/upload/v1654599490/group_mbuvht.png",
  });

  const populatedGroup = await ChatModel.findById(createdGroup._id)
    .populate("users", "-password -notifications")
    .populate("groupAdmin", "-password -notifications");

  res.status(201).json(populatedGroup);
});

const deleteGroupDP = asyncHandler(async (req, res) => {
  const { currentDP, cloudinary_id, chatId } = req.body;

  if (!currentDP || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for deleting group dp");
  }

  // Delete the existing dp only if it's not the default dp
  if (currentDP.endsWith("group_am193i.png")) {
    res.status(400);
    throw new Error("Cannot delete the default group dp");
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
    .populate("groupAdmin", "-password -notifications");

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
  if (!currentDP.endsWith("group_am193i.png")) {
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
    .populate("groupAdmin", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
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
    .populate("groupAdmin", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(updatedGroup);
});

const removeUserFromGroup = asyncHandler(async (req, res) => {
  const { userToBeRemoved, chatId } = req.body;
  // const loggedInUser = req.user?._id;

  if (!userToBeRemoved || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for remove user from group");
  }

  // Group admin check should be done in the frontend itself, to save time

  // What happens when userToBeRemoved === groupAdmin
  // What happens when a non-admin leaves a group when group length is only 3
  // What happens when an admin leaves a group

  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userToBeRemoved },
    },
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmin", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(updatedGroup);
});

const addUserToGroup = asyncHandler(async (req, res) => {
  const { userToBeAdded, chatId } = req.body;
  // const loggedInUser = req.user?._id;

  if (!userToBeAdded || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for adding user to group");
  }

  // Group admin check should be done in the frontend itself, to save time

  const updatedGroup = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userToBeAdded },
    },
    { new: true }
  )
    .populate("users", "-password -notifications")
    .populate("groupAdmin", "-password -notifications");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(updatedGroup);
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  // const loggedInUser = req.user?._id;

  if (!chatId) {
    res.status(400);
    throw new Error("Invalid chatId for deleting group");
  }

  // Group admin check should be done in the frontend itself, to save time

  const deletedGroup = await ChatModel.findByIdAndDelete(chatId)
    .populate("users", "-password -notifications")
    .populate("groupAdmin", "-password -notifications");

  if (!deletedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json(deletedGroup);
});

module.exports = {
  createOrRetrieveChat,
  fetchChats,
  createGroupChat,
  deleteGroupDP,
  updateGroupDP,
  updateGroupName,
  removeUserFromGroup,
  addUserToGroup,
  deleteGroupChat,
};
