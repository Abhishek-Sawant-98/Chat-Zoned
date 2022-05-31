const asyncHandler = require("express-async-handler");
const ChatModel = require("../models/chatModel");
const cloudinary = require("../config/cloudinary");
const deleteFile = require("../config/deleteFile");

const createOrRetrieveChat = asyncHandler(async (req, res) => {
  const receiverUserId = req.body?.userId;
  const loggedInUserId = req.user?._id;

  if (!receiverUserId) {
    return res.status(400).send({ message: "UserId not sent in request body" });
  }

  try {
    // First check if a chat exists with the above users
    const existingChats = await ChatModel.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: receiverUserId } },
        { users: { $elemMatch: loggedInUserId } },
      ],
    })
      .populate("users", "-password")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name email profilePic",
        },
      });

    if (existingChats.length > 0) {
      res.status(200).send(existingChats[0]);
    } else {
      // If it doesn't exist, then create a new chat
      const createdChat = await ChatModel.create({
        chatName: "reciever",
        isGroupChat: false,
        users: [receiverUserId, loggedInUserId],
      });

      const populatedChat = await ChatModel.findById(createdChat._id).populate(
        "users",
        "-password"
      );
      res.status(201).send(populatedChat);
    }
  } catch (error) {
    console.log("Error in create or retrieve chat route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user?._id;

  try {
    // Fetch all the chats for the currently logged-in user
    const chats = await ChatModel.find({
      users: { $elemMatch: loggedInUserId },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "lastMessage",
        // Nested populate in mongoose
        populate: {
          path: "sender",
          select: "name email profilePic",
        },
      })
      .sort({ updatedAt: -1 }); // sort from latest to oldest chat (descending order)

    res.status(200).send(chats);
  } catch (error) {
    console.log("Error in fetch chats route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  let { chatName, users } = req.body;
  const loggedInUserId = req.user?._id;

  if (!chatName || !users) {
    return res.status(400).send({ message: "Please enter all the fields" });
  }

  users = JSON.parse(users); // Since users array was stringified before sending it

  if (users.length < 2) {
    return res
      .status(400)
      .send({ message: "Minimum of 3 users needed to form a group" });
  }

  users.push(loggedInUserId); // Since group includes currently logged-in user too

  try {
    const createdGroup = await ChatModel.create({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin: loggedInUserId,
      chatDisplayPic:
        "https://res.cloudinary.com/abhi-sawant/image/upload/v1653670527/group_am193i.png",
    });

    const populatedGroup = await ChatModel.findById(createdGroup._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).send(populatedGroup);
  } catch (error) {
    console.log("Error in create group chat route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const deleteGroupDP = asyncHandler(async (req, res) => {
  const { currentDP, cloudinary_id, chatId } = req.body;

  if (!currentDP || !chatId) {
    return res.status(400).send({
      message: "Invalid request params for deleting group dp",
    });
  }

  // Delete the existing dp only if it's not the default dp
  if (currentDP.endsWith("group_am193i.png")) {
    return res
      .status(400)
      .send({ message: "Cannot delete the default group dp" });
  }

  try {
    await cloudinary.uploader.destroy(cloudinary_id);

    const updatedGroup = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        cloudinary_id: "",
        chatDisplayPic:
          "https://res.cloudinary.com/abhi-sawant/image/upload/v1653670527/group_am193i.png",
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroup) {
      res.status(404);
      throw new Error("Group not found");
    }

    res.status(200).send(updatedGroup);
  } catch (error) {
    console.log("Error in delete group dp route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const updateGroupDP = asyncHandler(async (req, res) => {
  const displayPic = req.file;
  const { currentDP, cloudinary_id, chatId } = req.body;

  if (!displayPic || !currentDP || !chatId) {
    return res.status(400).send({
      message: "Invalid request params for update group dp",
    });
  }

  try {
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
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroup) {
      res.status(404);
      throw new Error("Group not found");
    }

    res.status(200).send(updatedGroup);
  } catch (error) {
    console.log("Error in update group dp route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const updateGroupName = asyncHandler(async (req, res) => {
  const { groupName, chatId } = req.body;

  if (!groupName || !chatId) {
    return res.status(400).send({
      message: "Invalid request params for update group name",
    });
  }

  try {
    const updatedGroup = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        chatName: groupName,
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroup) {
      res.status(404);
      throw new Error("Group not found");
    }

    res.status(200).send(updatedGroup);
  } catch (error) {
    console.log("Error in update group name route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const removeUserFromGroup = asyncHandler(async (req, res) => {
  const { userToBeRemoved, chatId } = req.body;
  // const loggedInUser = req.user?._id;

  if (!userToBeRemoved || !chatId) {
    return res.status(400).send({
      message: "Invalid request params for remove user from group",
    });
  }

  // Group admin check should be done in the frontend itself, to save time

  // What happens when userToBeRemoved === groupAdmin
  // What happens when a non-admin leaves a group when group length is only 3
  // What happens when an admin leaves a group

  try {
    const updatedGroup = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userToBeRemoved },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroup) {
      res.status(404);
      throw new Error("Group not found");
    }

    res.status(200).send(updatedGroup);
  } catch (error) {
    console.log("Error in remove user from group route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const addUserToGroup = asyncHandler(async (req, res) => {
  const { userToBeAdded, chatId } = req.body;
  // const loggedInUser = req.user?._id;

  if (!userToBeAdded || !chatId) {
    return res.status(400).send({
      message: "Invalid request params for adding user to group",
    });
  }

  // Group admin check should be done in the frontend itself, to save time

  try {
    const updatedGroup = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userToBeAdded },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroup) {
      res.status(404);
      throw new Error("Group not found");
    }

    res.status(200).send(updatedGroup);
  } catch (error) {
    console.log("Error in add user to group route...");
    res.status(500);
    throw new Error(error.message);
  }
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  // const loggedInUser = req.user?._id;

  if (!chatId) {
    return res.status(400).send({
      message: "Invalid chatId for deleting group",
    });
  }

  // Group admin check should be done in the frontend itself, to save time

  try {
    const deletedGroup = await ChatModel.findByIdAndDelete(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!deletedGroup) {
      res.status(404);
      throw new Error("Group not found");
    }

    res.status(200).send(deletedGroup);
  } catch (error) {
    console.log("Error in delete group route...");
    res.status(500);
    throw new Error(error.message);
  }
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
