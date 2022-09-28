import { Server } from "socket.io";
import {
  addNotification,
  deleteNotifOnMsgDelete,
} from "../controllers/UserController.js";

// Message event listeners
const configureMsgEvents = (socket) => {
  socket.on("new_msg_sent", async (newMsg) => {
    const { chat } = newMsg;
    if (!chat) return;

    await Promise.all(
      chat.users.map(async (userId) => {
        // Emit 'newMsg' to all other users except 'newMsg' sender
        if (userId !== newMsg.sender._id) {
          const { notifications } = await addNotification(newMsg._id, userId);
          socket.to(userId).emit("new_msg_received", newMsg, notifications);
        }
      })
    );
  });

  socket.on("msg_deleted", async (deletedMsgData) => {
    const { deletedMsgId, senderId, chat } = deletedMsgData;
    if (!deletedMsgId || !senderId || !chat) return;

    // Emit a socket to delete 'deletedMsg' for all chat users
    // except 'deletedMsg' sender
    await Promise.all(
      chat.users.map(async (user) => {
        if (user._id !== senderId) {
          await deleteNotifOnMsgDelete(deletedMsgId, user._id);
          socket.to(user._id).emit("remove_deleted_msg", deletedMsgData);
        }
      })
    );
  });

  socket.on("msg_updated", (updatedMsg) => {
    const { sender, chat } = updatedMsg;
    if (!sender || !chat) return;

    chat.users.forEach((userId) => {
      if (userId !== sender._id) {
        socket.to(userId).emit("update_modified_msg", updatedMsg);
      }
    });
  });
};

// Group event listeners
const configureGroupEvents = (socket) => {
  socket.on("new_grp_created", (newGroupData) => {
    const { admin, newGroup } = newGroupData;
    if (!admin || !newGroup) return;

    newGroup.users.forEach((user) => {
      if (user._id !== admin._id) {
        socket.to(user._id).emit("display_new_grp");
      }
    });
  });

  socket.on("grp_updated", (updatedGroupData) => {
    // 'updater' is the one who updated the grp (admin/non-admin)
    const { updater, updatedGroup } = updatedGroupData;
    if (!updater || !updatedGroup) return;
    const { removedUser } = updatedGroup;

    updatedGroup.users.forEach((user) => {
      if (user._id !== updater._id) {
        socket.to(user._id).emit("display_updated_grp", updatedGroupData);
      }
    });
    if (removedUser) {
      socket.to(removedUser._id).emit("display_updated_grp", updatedGroupData);
    }
  });

  socket.on("grp_deleted", (deletedGroupData) => {
    // 'admin' is the one who updated the grp
    const { admin, deletedGroup } = deletedGroupData;
    if (!admin || !deletedGroup) return;

    deletedGroup.users.forEach((user) => {
      if (user._id !== admin._id) {
        socket.to(user._id).emit("remove_deleted_grp", deletedGroup);
      }
    });
  });
};

// Typing event listeners
const configureTypingEvents = (socket) => {
  socket.on("typing", (chat, typingUser) => {
    if (!chat || !typingUser) return;
    chat.users?.forEach((user) => {
      if (user?._id !== typingUser?._id) {
        socket.to(user?._id).emit("display_typing", chat, typingUser);
      }
    });
  });

  socket.on("stop_typing", (chat, typingUser) => {
    if (!chat || !typingUser) return;
    chat.users?.forEach((user) => {
      if (user?._id !== typingUser?._id) {
        socket.to(user?._id).emit("hide_typing", chat, typingUser);
      }
    });
  });
};

// Disconnect event listeners
const configureDisconnectEvents = (socket) => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.off("init_user", (userId) => {
    console.log("User socket disconnected");
    socket.leave(userId);
  });
};

const configureSocketEvents = (server) => {
  // Sockets setup
  const io = new Server(server, {
    pingTimeout: 120000,
    cors: { origin: "http://localhost:3000" },
  });

  io.on("connection", (socket) => {
    // Initialize user
    socket.on("init_user", (userId) => {
      socket.join(userId);
      socket.emit(`user_connected`);
      console.log("user initialized: ", userId);
    });

    // Initialize chat
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat : ${chatId}`);
    });

    configureMsgEvents(socket);
    configureGroupEvents(socket);
    configureTypingEvents(socket);
    configureDisconnectEvents(socket);
  });
};

export default configureSocketEvents;
