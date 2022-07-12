require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToMongoDB = require("./config/db");
const UserRoutes = require("./routes/UserRoutes");
const ChatRoutes = require("./routes/ChatRoutes");
const MessageRoutes = require("./routes/MessageRoutes");
const path = require("path");
const socketio = require("socket.io");
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
const io = socketio(server, {
  pingTimeout: 90000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // Socket event listeners
  socket.on("init user", (user) => {
    socket.join(user._id);
    socket.emit(`user connected`);
  });

  socket.on("join chat", (chat) => {
    socket.join(chat._id);
    console.log(`User joined chat : ${chat._id}`);
  });

  socket.on("new msg sent", (newMsg) => {
    const { chat } = newMsg;

    if (!chat)
      return console.log(`Chat not found for new message : ${newMsg._id}`);

    chat.users.forEach((user) => {
      // Emit 'newMessage' in the sockets of all other users except the sender of newMessage
      if (user._id === newMsg.sender._id) return;

      socket
        .to(user._id)
        .emit("new msg received", { userId: user._id, ...newMsg });
    });
  });

  // Free up resources to save bandwidth
  socket.off("init user", (user) => {
    console.log("User socket disconnected");
    socket.leave(user._id);
  });
});
