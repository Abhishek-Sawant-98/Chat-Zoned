const asyncHandler = require("express-async-handler");
const MessageModel = require("../models/MessageModel");
const ChatModel = require("../models/chatModel");
const { deleteFile, deleteExistingAttachment } = require("../utils/deleteFile");
const cloudinary = require("../config/cloudinary");
const path = require("path");

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
  res
    .status(200)
    .json({ messages, baseUrl: path.join(__dirname, "../messageFiles/") });
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
    attachmentData = {
      fileUrl: null,
      file_id: null,
    };
  } else if (
    /(\.png|\.jpg|\.jpeg|\.gif|\.svg)$/.test(attachment.originalname)
  ) {
    const uploadResponse = await cloudinary.uploader.upload(attachment.path);
    attachmentData = {
      fileUrl: uploadResponse.secure_url,
      file_id: uploadResponse.public_id,
    };
    deleteFile(attachment.path);
  } else {
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
  // Update the lastMessage of current chat with newly created message
  const updateChatPromise = ChatModel.findByIdAndUpdate(chatId, {
    lastMessage: createdMessage._id,
  });

  const populatedMsgPromise = MessageModel.findById(createdMessage._id)
    .populate({
      path: "sender",
      model: "User",
      select: "-password -notifications",
    })
    .populate({
      path: "chat",
      model: "Chat",
      select: "-groupAdmins -cloudinary_id",
    });
  // Parallel execution of independent promises
  const [updatedChat, populatedMessage] = await Promise.all([
    updateChatPromise,
    populatedMsgPromise,
  ]);

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
    // Attachment already exists but deleted by user while updating
    if (file_id) deleteExistingAttachment(fileUrl, file_id);

    // Attachment neither already exists nor deleted by user
    attachmentData = {
      fileUrl: null,
      file_id: null,
    };
  } else if (
    /(\.png|\.jpg|\.jpeg|\.gif|\.svg)$/.test(updatedAttachment.originalname)
  ) {
    // Updated attachment is of type : image/gif
    if (file_id) deleteExistingAttachment(fileUrl, file_id);

    // Upload updated attachment to cloudinary and then delete from server
    const uploadResponse = await cloudinary.uploader.upload(
      updatedAttachment.path
    );
    attachmentData = {
      fileUrl: uploadResponse.secure_url,
      file_id: uploadResponse.public_id,
    };
    deleteFile(updatedAttachment.path);
  } else {
    // Updated attachment is of non-image type
    if (file_id) deleteExistingAttachment(fileUrl, file_id);

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
  res.status(200).json(updatedMessage);
});

const deleteMessages = asyncHandler(async (req, res) => {
  let { messageIds, isDeleteGroupRequest } = req.body;
  messageIds = JSON.parse(messageIds);

  if (!messageIds?.length) {
    res.status(400);
    throw new Error("Invalid messageIds for deleting message/s");
  }
  const resolvedMessage = "Message Deleted Successfully";

  // Deleting each message attachment, message in parallel
  await Promise.all(
    messageIds.map(async (msgId) => {
      const existingMessage = await MessageModel.findById(msgId);

      if (!existingMessage) {
        res.status(404);
        throw new Error("Message to be deleted not found");
      }
      const { file_id, fileUrl } = existingMessage;

      if (file_id) deleteExistingAttachment(fileUrl, file_id);

      const deletedMessage = await MessageModel.findByIdAndDelete(msgId)
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
        !isDeleteGroupRequest &&
        JSON.stringify(msgId) ===
          JSON.stringify(deletedMessage.chat.lastMessage)
      ) {
        // Retrive the previous message
        const latestMessages = await MessageModel.find({
          chat: deletedMessage.chat._id,
        }).sort({ createdAt: "desc" }); // (latest to oldest)

        // If there's no previous message, don't update lastMessage
        if (latestMessages.length === 0) return resolvedMessage;

        // Since lastMessage was deleted, previousMessage is the latest
        const previousMessage = latestMessages[0];

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
      return resolvedMessage;
    })
  );
  res.status(200).json({ status: "Messages Deleted Successfully" });
});

module.exports = { fetchMessages, sendMessage, updateMessage, deleteMessages };
