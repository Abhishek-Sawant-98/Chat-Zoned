require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToMongoDB = require("./config/db");
const UserRoutes = require("./routes/UserRoutes");
const ChatRoutes = require("./routes/ChatRoutes");
const MessageRoutes = require("./routes/MessageRoutes");
const path = require("path");
const {
  notFoundHandler,
  appErrorHandler,
} = require("./middleware/ErrorMiddleware");

connectToMongoDB();

const app = express();

// Config middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// App routes
app.use("/api/user", UserRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/message", MessageRoutes);

const PORT = process.env.PORT || 5000;

// ------------------ Deployment ----------------------- //
if (process.env.NODE_ENV === "production") {
  // Establishes the path to our frontend (most important)
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
  );
}
// ------------------ Deployment ----------------------- //

// Error middlewares
app.all("*", notFoundHandler);
app.use(appErrorHandler);

const server = app.listen(PORT, () =>
  console.log(`📍 Server started at port ${PORT}`)
);

// Sockets setup
const io = require("socket.io")(server, {
  pingTimeout: 90000,
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

  socket.on("new msg sent", (newMsg) => {
    const { chat } = newMsg;
    if (!chat) return;

    chat.users.forEach((userId) => {
      // Emit 'newMsg' to all other users except the sender of newMsg
      if (userId !== newMsg.sender._id) {
        socket.to(userId).emit("new msg received", newMsg);
      }
    });
  });

  socket.on("msg deleted", (deletedMsgData) => {
    const { deletedMsgId, senderId, chat } = deletedMsgData;
    if (!deletedMsgId || !senderId || !chat) return;

    chat.users.forEach((user) => {
      // Emit a socket to delete 'deletedMsg' for all chat users
      // except sender of deletedMsg
      if (user._id !== senderId) {
        socket.to(user._id).emit("remove deleted msg", deletedMsgId);
      }
    });
  });

  socket.on("msg updated", (updatedMsg) => {
    const { sender, chat } = updatedMsg;
    if (!sender || !chat) return;

    chat.users.forEach((user) => {
      if (user._id !== sender._id) {
        socket.to(user._id).emit("update updated msg", updatedMsg);
      }
    });
  });

  socket.on("new grp created", (newGroup) => {
    const admin = newGroup?.groupAdmins[0];
    if (!admin) return;

    newGroup.users.forEach((user) => {
      if (user._id !== admin._id) {
        socket.to(user._id).emit("display new grp");
      }
    });
  });

  socket.on("grp updated", (updatedGroupData) => {
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

  // Free up resources to save bandwidth
  socket.off("init user", (userId) => {
    console.log("User socket disconnected");
    socket.leave(userId);
  });
});
