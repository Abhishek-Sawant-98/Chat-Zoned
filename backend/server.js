import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectToMongoDB from "./config/db.js";
import UserRoutes from "./routes/UserRoutes.js";
import ChatRoutes from "./routes/ChatRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import path from "path";
import { Server } from "socket.io";
import {
  notFoundHandler,
  appErrorHandler,
} from "./middleware/ErrorMiddleware.js";

connectToMongoDB();

const app = express();
const DIRNAME = path.resolve();
const PORT = process.env.PORT || 5000;

// Config middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// App routes
app.use("/api/user", UserRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/message", MessageRoutes);

// ====================  Deployment ========================= //
if (process.env.NODE_ENV === "production") {
  // Establishes the path to our frontend (most important)
  app.use(express.static(path.join(DIRNAME, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(DIRNAME, "/frontend/build/index.html"))
  );
}
// ====================  Deployment ========================= //

// Error middlewares
app.all("*", notFoundHandler);
app.use(appErrorHandler);

const server = app.listen(PORT, () =>
  console.log(`📍 Server started at port ${PORT}`)
);

// Sockets setup
const io = new Server(server, {
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
    console.log("new msg sent");
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
    console.log("msg deleted");
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
    console.log("msg updated");
    const { sender, chat } = updatedMsg;
    if (!sender || !chat) return;

    chat.users.forEach((user) => {
      if (user._id !== sender._id) {
        socket.to(user._id).emit("update modified msg", updatedMsg);
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
