const asyncHandler = require("express-async-handler");
const MessageModel = require("../models/MessageModel");
const ChatModel = require("../models/chatModel");
const { deleteFile, deleteExistingAttachment } = require("../utils/deleteFile");
const cloudinary = require("../config/cloudinary");

const fetchMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400);
    throw new Error("Invalid chatId for fetching messages");
  }

  const messages = await MessageModel.find({ chat: chatId })
    .populate({
      path: "sender",
      model: "User",
      select: "-password -notifications",
    })
    .sort({ createdAt: "asc" }); // (oldest to latest)
  res.status(200).json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const attachment = req.file;
  const { content, chatId } = req.body;
  const loggedInUser = req.user?._id;

  if ((!content && !attachment) || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for sending a message");
  }

  let attachmentData;
  if (!attachment) {
    console.log("No attachment sent in message");
    attachmentData = {
      fileUrl: null,
      file_id: null,
    };
  } else if (/(\.png|\.jpg|\.jpeg|\.gif)$/.test(attachment.originalname)) {
    console.log("Image attachment sent in message");
    const uploadResponse = await cloudinary.uploader.upload(attachment.path);
    await deleteFile(attachment.path); // delete the image/gif from server once uploaded to cloudinary

    attachmentData = {
      fileUrl: uploadResponse.secure_url,
      file_id: uploadResponse.public_id,
    };
  } else {
    console.log("Non-image attachment sent in message");
    attachmentData = {
      fileUrl: attachment.filename,
      file_id: attachment.path,
    };
  }

  const createdMessage = await MessageModel.create({
    sender: loggedInUser,
    ...attachmentData,
    content: content || "",
    chat: chatId,
  });

  if (!createdMessage) {
    res.status(404);
    throw new Error("Message not found");
  }

  const populatedMessage = await MessageModel.findById(createdMessage._id)
    .populate({
      path: "sender",
      model: "User",
      select: "name email profilePic",
    })
    .populate({
      path: "chat",
      model: "Chat",
      select: "chatName isGroupChat chatDisplayPic",
    });

  // Update the lastMessage of the current chat with the newly created message
  const updatedChat = await ChatModel.findByIdAndUpdate(chatId, {
    lastMessage: populatedMessage,
  });

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found while updating lastMessage");
  }

  res.status(201).json(populatedMessage);
});

const updateMessage = asyncHandler(async (req, res) => {
  const updatedAttachment = req.file;
  const { updatedContent, messageId } = req.body;

  if ((!updatedContent && !updatedAttachment) || !messageId) {
    res.status(400);
    throw new Error("Invalid request params for updating a message");
  }

  const existingMessage = await MessageModel.findById(messageId);

  if (!existingMessage) {
    res.status(404);
    throw new Error("Message not found");
  }

  let attachmentData;
  const { file_id, fileUrl } = existingMessage;

  if (!updatedAttachment) {
    if (file_id) {
      // Attachment already exists but deleted by user while updating
      console.log("Attachment deleted by user");
      await deleteExistingAttachment(fileUrl, file_id);
    }
    // Attachment neither already exists nor deleted by user
    attachmentData = {
      fileUrl: null,
      file_id: null,
    };
  } else if (
    /(\.png|\.jpg|\.jpeg|\.gif)$/.test(updatedAttachment.originalname)
  ) {
    // Updated attachment is of type : image/gif
    console.log("Updated attachment is of type : image/gif");
    if (file_id) await deleteExistingAttachment(fileUrl, file_id);

    const uploadResponse = await cloudinary.uploader.upload(
      updatedAttachment.path
    );
    await deleteFile(updatedAttachment.path); // delete the image/gif from server once uploaded to cloudinary

    attachmentData = {
      fileUrl: uploadResponse.secure_url,
      file_id: uploadResponse.public_id,
    };
  } else {
    // Updated attachment is of non-image type
    console.log("Updated attachment is of non-image type");
    if (file_id) await deleteExistingAttachment(fileUrl, file_id);

    attachmentData = {
      fileUrl: updatedAttachment.filename,
      file_id: updatedAttachment.path,
    };
  }

  const updatedMessage = await MessageModel.findByIdAndUpdate(
    messageId,
    {
      ...attachmentData,
      content: updatedContent || "",
    },
    { new: true }
  )
    .populate({
      path: "sender",
      model: "User",
      select: "name email profilePic",
    })
    .populate({
      path: "chat",
      model: "Chat",
      select: "-groupAdmins -cloudinary_id",
    });

  if (!updatedMessage) {
    res.status(404);
    throw new Error("Updated message not found");
  }

  // If the updated message is the last message of the current chat
  if (messageId === updatedMessage.chat.lastMessage) {
    // Update the lastMessage of the current chat with the newly updated message
    const updatedChat = await ChatModel.findByIdAndUpdate(
      updatedMessage.chat._id,
      {
        lastMessage: updatedMessage._id,
      },
      { new: true }
    );

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat not found while updating lastMessage");
    }
    console.log("Updated lastMessage of current chat");
  }

  res.status(200).json(updatedMessage);
});

const deleteMessages = asyncHandler(async (req, res) => {
  let { messageIds } = req.body;
  messageIds = JSON.parse(messageIds);

  if (!messageIds?.length) {
    res.status(400);
    throw new Error("Invalid messageId for deleting a message");
  }

  messageIds.forEach(async (messageId) => {
    const existingMessage = await MessageModel.findById(messageId);

    if (!existingMessage) {
      res.status(404);
      throw new Error("Message to be deleted not found");
    }
    const { file_id, fileUrl } = existingMessage;

    if (file_id) await deleteExistingAttachment(fileUrl, file_id);

    const deletedMessage = await MessageModel.findByIdAndDelete(messageId)
      .populate({
        path: "sender",
        model: "User",
        select: "name email",
      })
      .populate({
        path: "chat",
        model: "Chat",
      });

    // If deleted message is the last message of current chat
    if (
      JSON.stringify(messageId) ===
      JSON.stringify(deletedMessage.chat.lastMessage)
    ) {
      // Retrive the previous message
      const latestMessages = await MessageModel.find({
        chat: deletedMessage.chat._id,
      }).sort({ createdAt: "desc" }); // (latest to oldest)

      // If there's no previous message, don't update lastMessage
      if (latestMessages.length === 0) return;

      const previousMessage = latestMessages[0]; // Since lastMessage was deleted

      // Update the lastMessage of current chat with previous message
      const updatedChat = await ChatModel.findByIdAndUpdate(
        deletedMessage.chat._id,
        {
          lastMessage: previousMessage._id,
        },
        { new: true }
      );

      if (!updatedChat) {
        res.status(404);
        throw new Error("Chat not found while updating lastMessage");
      }
    }
  });

  res.status(200).json({ status: "Messages Deleted Successfully" });
});

module.exports = { fetchMessages, sendMessage, updateMessage, deleteMessages };
