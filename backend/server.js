const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
require("dotenv").config();

// ================= DATABASE =================
const connectDB = require("./config/db");

// ================= ROUTES =================
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const negotiationRoutes = require("./routes/negotiationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const transportRoutes = require("./routes/transportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");

// ================= APP INIT =================
const app = express();
const server = http.createServer(app);

// ================= CONNECT DB =================
connectDB();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: "http://localhost:5173", // 🔥 IMPORTANT (your frontend)
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("AgroBridge API is running");
});

// ================= API ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transports", transportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = {};

app.set("io", io);
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {

  console.log("🟢 User connected:", socket.id);

  socket.on("registerUser", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("userOnline", userId);
  });

  socket.on("checkOnlineStatus", (userId) => {
    if (onlineUsers[userId]) {
      socket.emit("userOnline", userId);
    }
  });

  socket.on("joinNegotiation", (negotiationId) => {
    socket.join(negotiationId);
  });

  socket.on("sendMessage", ({ negotiationId, message }) => {
    io.to(negotiationId).emit("receiveMessage", {
      negotiationId,
      ...message
    });
  });

  socket.on("markAsRead", ({ negotiationId, userId }) => {
    io.to(negotiationId).emit("messagesRead", {
      negotiationId,
      readerId: userId
    });
  });

  socket.on("deleteMessage", ({ negotiationId, messageId }) => {
    io.to(negotiationId).emit("messageDeleted", {
      negotiationId,
      messageId
    });
  });

  socket.on("editMessage", ({ negotiationId, messageId, newText }) => {
    io.to(negotiationId).emit("messageEdited", {
      negotiationId,
      messageId,
      newText
    });
  });

  socket.on("sendNotification", ({ userId, notification }) => {
    const socketId = onlineUsers[userId];
    if (socketId) {
      io.to(socketId).emit("receiveNotification", notification);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        io.emit("userOffline", userId);
        break;
      }
    }
  });

});

// ================= ERROR HANDLER (NEW) =================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    message: "Internal Server Error"
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 AgroBridge Server running on port ${PORT}`);
});