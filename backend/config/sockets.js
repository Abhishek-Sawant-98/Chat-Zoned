import { Server } from "socket.io";
import { addNotification } from "../controllers/UserController.js";

const configureSockets = (server) => {
  // Sockets setup
  const io = new Server(server, {
    pingTimeout: 120000,
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {
    // Socket event listeners
    socket.on("init user", (userId) => {
      socket.join(userId);
      socket.emit(`user connected`);
      console.log("user initialized: ", userId);
    });

    socket.on("join chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat : ${chatId}`);
    });

    socket.on("new msg sent", async (newMsg) => {
      const { chat } = newMsg;
      if (!chat) return;

      await Promise.all(
        chat.users.map(async (userId) => {
          // Emit 'newMsg' to all other users except 'newMsg' sender
          if (userId !== newMsg.sender._id) {
            const { notifications } = await addNotification(newMsg._id, userId);
            socket.to(userId).emit("new msg received", newMsg, notifications);
          }
        })
      );
    });

    socket.on("msg deleted", (deletedMsgData) => {
      const { deletedMsgId, senderId, chat } = deletedMsgData;
      if (!deletedMsgId || !senderId || !chat) return;

      chat.users.forEach((user) => {
        // Emit a socket to delete 'deletedMsg' for all chat users
        // except 'deletedMsg' sender
        if (user._id !== senderId) {
          socket.to(user._id).emit("remove deleted msg", deletedMsgData);
        }
      });
    });

    socket.on("msg updated", (updatedMsg) => {
      console.log("msg updated");
      const { sender, chat } = updatedMsg;
      if (!sender || !chat) return;

      chat.users.forEach((userId) => {
        if (userId !== sender._id) {
          socket.to(userId).emit("update modified msg", updatedMsg);
        }
      });
    });

    socket.on("new grp created", (newGroup) => {
      console.log("new grp created");
      const admin = newGroup?.groupAdmins[0];
      if (!admin) return;

      newGroup.users.forEach((user) => {
        if (user._id !== admin._id) {
          socket.to(user._id).emit("display new grp");
        }
      });
    });

    socket.on("grp updated", (updatedGroupData) => {
      console.log("grp updated");
      const { admin, updatedGroup } = updatedGroupData;
      if (!admin || !updatedGroup) return;

      updatedGroup.users.forEach((user) => {
        if (user._id !== admin._id) {
          socket.to(user._id).emit("display updated grp", updatedGroup);
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.off("init user", (userId) => {
      console.log("User socket disconnected");
      socket.leave(userId);
    });
  });
};

export default configureSockets;
