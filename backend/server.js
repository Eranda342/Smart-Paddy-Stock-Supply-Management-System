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

// ================= DATABASE CONNECTION =================
connectDB();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// ================= STATIC FILES =================
// This allows access to uploaded documents
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
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track online users
const onlineUsers = {};

io.on("connection", (socket) => {

  console.log("🟢 User connected:", socket.id);

  // Register logged user
  socket.on("registerUser", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("userOnline", userId); // broadcast online
  });

  // Check online status
  socket.on("checkOnlineStatus", (userId) => {
    if (onlineUsers[userId]) {
      socket.emit("userOnline", userId);
    }
  });

  // Join negotiation room
  socket.on("joinNegotiation", (negotiationId) => {
    socket.join(negotiationId);
  });

  // Send negotiation message
  socket.on("sendMessage", ({ negotiationId, message }) => {
    io.to(negotiationId).emit("receiveMessage", {
      negotiationId,
      ...message,
    });
  });

  // Mark all as read
  socket.on("markAsRead", ({ negotiationId, userId }) => {
    io.to(negotiationId).emit("messagesRead", { negotiationId, readerId: userId });
  });

  // Delete message event
  socket.on("deleteMessage", ({ negotiationId, messageId }) => {
    io.to(negotiationId).emit("messageDeleted", { negotiationId, messageId });
  });

  // Edit message event
  socket.on("editMessage", ({ negotiationId, messageId, newText }) => {
    io.to(negotiationId).emit("messageEdited", { negotiationId, messageId, newText });
  });

  // Send notification to specific user
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
        io.emit("userOffline", userId); // broadcast offline
        break;
      }
    }
  });

});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 AgroBridge Server running on port ${PORT}`);
});