import asyncHandler from "express-async-handler";
import MessageModel from "../models/MessageModel.js";
import ChatModel from "../models/ChatModel.js";
import { deleteFile, deleteExistingAttachment } from "../utils/deleteFile.js";
import cloudinary from "../config/cloudinary.js";
import { s3, s3_bucket } from "../config/aws_S3.js";

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
    .sort({ createdAt: "desc" });
  // Latest to oldest here, but oldest to latest in frontend
  // as it's 'd-flex flex-column-reverse' for msg list
  res.status(200).json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const attachment = req.file;
  const { mediaDuration, content, chatId } = req.body;
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
      file_name: null,
    };
  } else if (
    /(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp)$/.test(attachment.originalname)
  ) {
    const uploadResponse = await cloudinary.uploader.upload(attachment.path);
    attachmentData = {
      fileUrl: uploadResponse.secure_url,
      file_id: uploadResponse.public_id,
      file_name: attachment.originalname,
    };
    deleteFile(attachment.path);
  } else {
    // For any other file type, it's uploaded via uploadToS3 middleware
    attachmentData = {
      fileUrl: attachment.location || "",
      file_id: attachment.key || "",
      file_name:
        attachment.originalname +
        "===" +
        (mediaDuration !== "undefined"
          ? `${mediaDuration}+++${attachment.size}`
          : attachment.size),
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
  const { msgFileRemoved, mediaDuration, updatedContent, messageId } = req.body;
  const fileRemoved = msgFileRemoved === "true";

  if (!messageId) {
    res.status(404);
    throw new Error("Invalid Message Id");
  }
  const existingMessage = await MessageModel.findById(messageId);

  if (!existingMessage) {
    res.status(404);
    throw new Error("Message not found");
  }

  const { file_id, fileUrl, file_name } = existingMessage;
  let attachmentData = { fileUrl, file_id, file_name };

  if (!(updatedAttachment || (file_id && !fileRemoved)) && !updatedContent) {
    res.status(400);
    throw new Error(
      "A Message Must Contain Either a File or some Text Content"
    );
  }

  if (!updatedAttachment) {
    // Attachment already exists but deleted by user while updating
    if (file_id && fileRemoved) {
      deleteExistingAttachment(fileUrl, file_id);
      attachmentData = {
        fileUrl: null,
        file_id: null,
        file_name: null,
      };
    }
  } else if (
    /(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp)$/.test(
      updatedAttachment.originalname
    )
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
      file_name: updatedAttachment.originalname,
    };
    deleteFile(updatedAttachment.path);
  } else {
    // For any other file type, it's uploaded via uploadToS3 middleware
    attachmentData = {
      fileUrl: updatedAttachment.location || "",
      file_id: updatedAttachment.key || "",
      file_name:
        updatedAttachment.originalname +
        "===" +
        (mediaDuration !== "undefined"
          ? `${mediaDuration}+++${updatedAttachment.size}`
          : updatedAttachment.size),
    };
    if (file_id) deleteExistingAttachment(fileUrl, file_id);
  }

  const updatedMessage = await MessageModel.findByIdAndUpdate(
    messageId,
    { ...attachmentData, content: updatedContent || "" },
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
  const resolvedMessage = "Successfully Deleted a Message";

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
          { lastMessage: previousMessage._id },
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
  res.status(200).json({ status: "Message/s Deleted Successfully" });
});

const accessAttachment = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const params = { Bucket: s3_bucket, Key: filename };
  const fileObj = await s3.getObject(params).promise();
  res.status(200).send(fileObj.Body);
});

export {
  fetchMessages,
  sendMessage,
  updateMessage,
  deleteMessages,
  accessAttachment,
};
