const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();
const openapi = require("./docs/openapi");

// ================= DATABASE =================
const connectDB = require("./config/db");

// ================= ROUTES =================
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const negotiationRoutes = require("./routes/negotiationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const transportRoutes = require("./routes/transportRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const maintenanceMode = require("./middleware/maintenanceMode");

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

// ================= API DOCS =================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.get("/api-docs.json", (req, res) => res.json(openapi));

// ================= STATIC FILES =================
// Resolve uploads dir relative to this file so it works regardless of cwd
const UPLOADS_DIR = path.resolve(__dirname, "uploads");
console.log("📁 Serving uploads from:", UPLOADS_DIR);
app.use("/uploads", express.static(UPLOADS_DIR));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("AgroBridge API is running");
});

// ================= API ROUTES =================
app.use("/api/users", userRoutes);       // existing user routes
app.use("/api/auth", userRoutes);        // alias: register + login via /api/auth
app.use("/api/listings", listingRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transports", transportRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/disputes", disputeRoutes);

// ================= MAINTENANCE MODE GUARD =================
// Applied AFTER auth/admin routes are mounted so admin can still pass through
app.use(maintenanceMode);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = {};

app.set("io", io);
global.io = io;
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {

  console.log("🟢 User connected:", socket.id);

  socket.on("registerUser", (userId) => {
    onlineUsers[userId] = socket.id;
    socket.join(userId);
    io.emit("userOnline", userId);
  });

  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
  });

  socket.on("checkOnlineStatus", (userId) => {
    if (onlineUsers[userId]) {
      socket.emit("userOnline", userId);
    }
  });

  socket.on("joinDispute", (disputeId) => socket.join(disputeId));
  socket.on("joinNegotiation", (negotiationId) => {
    socket.join(negotiationId);
  });

  socket.on("sendMessage", ({ negotiationId, message }) => {
    io.to(negotiationId).emit("receiveMessage", {
      negotiationId,
      message
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


// ================= CRON JOBS =================
const cron = require("node-cron");
const Transaction = require("./models/Transaction");
const Dispute = require("./models/Dispute");
const SystemSetting = require("./models/SystemSetting");

cron.schedule("0 * * * *", async () => {
  try {
    const settings = await SystemSetting.findOne();
    const delayDays = settings ? settings.autoDisputeDays : 3;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - delayDays);

    const overdueTransactions = await Transaction.find({
      transportStatus: "DELIVERED",
      paymentStatus: "PENDING",
      updatedAt: { $lte: thresholdDate },
    });

    for (let txn of overdueTransactions) {
      const existing = await Dispute.findOne({ transaction: txn._id });
      if (!existing) {
        const dispute = new Dispute({
          title: "Automated Payment Delay Alert",
          description: `System auto-detected that transaction #${txn._id} was delivered past the automated dispute threshold but payment is still pending.`,
          transaction: txn._id,
          status: "OPEN",
          autoGenerated: true,
        });
        await dispute.save();
        if (global.io) global.io.emit("disputeUpdated"); 
      }
    }
  } catch (err) {
    console.error("Cron Error:", err);
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 AgroBridge Server running on port ${PORT}`);
});
