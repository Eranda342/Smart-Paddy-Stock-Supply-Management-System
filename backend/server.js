const dns = require("dns");

// Force public DNS (bypass broken local resolver)
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const swaggerUi = require("swagger-ui-express");
const passport = require("passport");
require("dotenv").config();
const openapi = require("./docs/openapi");

// ================= PASSPORT (Google OAuth) =================
require("./config/passportGoogle");

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

const reportRoutes = require("./routes/reportRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const maintenanceMode = require("./middleware/maintenanceMode");

// ================= APP INIT =================
const app = express();
// 🔥 REQUIRED FOR AZURE (reverse proxy fix)
app.set("trust proxy", 1);
const server = http.createServer(app);

// ================= SECURITY HEADERS (Helmet) =================
// crossOriginResourcePolicy: cross-origin keeps Cloudinary images loadable
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ================= RATE LIMITER =================
// Applied ONLY to /api — does NOT touch socket.io or static files
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per IP per window
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,      // Disable the X-RateLimit-* legacy headers
  message: { message: "Too many requests, please try again later." },
});

// ================= CONNECT DB =================
connectDB();

// ================= MIDDLEWARE =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://witty-ocean-03e5bca00.7.azurestaticapps.net"
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps / curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize()); // Passport – stateless (session: false)

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

// ================= MAINTENANCE MODE GUARD =================
// Applies globally, but middleware internally skips /admin and /auth
app.use(maintenanceMode);

app.use((req, res, next) => {
  // Azure fix for websocket upgrade
  if (req.headers["x-forwarded-proto"] === "https") {
    req.secure = true;
  }
  next();
});

// ================= API ROUTES =================
// Apply rate limiter only to /api (not socket.io / uploads / health)
app.use("/api", apiLimiter);
app.use("/api/users", userRoutes);                          // existing user routes
app.use("/api/auth", userRoutes);                           // alias: register + login via /api/auth
app.use("/api/auth", require("./routes/authGoogle"));       // Google OAuth routes
app.use("/api/listings", listingRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transports", transportRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);

app.use("/api/disputes", disputeRoutes);



// ================= SOCKET.IO =================
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://witty-ocean-03e5bca00.7.azurestaticapps.net"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  // 🔥 FORCE WEBSOCKET FIRST
  transports: ["websocket", "polling"],
  // 🔥 REQUIRED FOR AZURE STABILITY
  allowEIO3: true,
});

const onlineUsers = {};

app.set("io", io);
global.io = io;
app.set("onlineUsers", onlineUsers);

// ================= SOCKET AUTH MIDDLEWARE =================
// Verifies JWT from handshake.auth.token.
// Falls back safely — no token = connected but unauthenticated (no crash).
const jwt = require("jsonwebtoken");
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn("⚠️  Socket connected without token (unauthenticated)");
      return next(); // allow connection — room guards enforce restrictions
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // attach decoded payload (has .id, .role, etc.)
    next();
  } catch (err) {
    console.warn("❌ Socket auth: invalid token —", err.message);
    next(); // do NOT block connection; room guards handle the restriction
  }
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    // 🔒 Require authenticated socket
    if (!socket.user) {
      console.warn("❌ Unauthorized join attempt (no token):", userId);
      socket.emit("socket_error", "Unauthorized");
      return;
    }
    // 🔒 Prevent joining another user's room
    if (socket.user.id !== userId) {
      console.warn("❌ join: user ID mismatch:", socket.user.id, "≠", userId);
      socket.emit("socket_error", "Unauthorized");
      return;
    }
    socket.join(userId);
    console.log(`👤 Secure join: ${userId}`);
  });

  socket.on("registerUser", (userId) => {
    if (!userId) return;
    // 🔒 Only allow registering own socket
    if (!socket.user || socket.user.id !== userId) {
      console.warn("❌ registerUser: unauthorized or ID mismatch:", userId);
      socket.emit("socket_error", "Unauthorized");
      return;
    }
    onlineUsers[userId] = socket.id;
    socket.join(userId);
    io.emit("userOnline", userId);
  });

  socket.on("joinUserRoom", (userId) => {
    if (!socket.user || socket.user.id !== userId) {
      console.warn("❌ joinUserRoom: unauthorized or ID mismatch:", userId);
      return;
    }
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
    socket.join(`negotiation_${negotiationId}`); // STEP 5: Room per negotiation
  });

  socket.on("sendMessage", ({ negotiationId, message, receiverId }) => {
    // 🔒 Only authenticated sockets may send messages
    if (!socket.user) {
      console.warn("❌ Unauthorized message attempt (no token)");
      socket.emit("socket_error", "Unauthorized");
      return;
    }

    // Legacy / current API
    io.to(negotiationId).emit("receiveMessage", {
      negotiationId,
      message
    });
    
    // STEP 4: Live updates to receiver room
    if (receiverId) {
      io.to(receiverId).emit("new_message", message);
    }

    // STEP 5: Emit to negotiation room
    io.to(`negotiation_${negotiationId}`).emit("update", message);
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

  // ── Typing indicator relay ────────────────────────────────────────
  // Frontend emits: "typing" { negotiationId, userId, isTyping }
  // Backend relays: "userTyping" { userId, isTyping } → negotiation room
  socket.on("typing", ({ negotiationId, userId, isTyping }) => {
    // 🔒 Only authenticated sockets may broadcast typing state
    if (!socket.user) return;

    // Relay to the negotiation room (excluding sender)
    socket.to(`negotiation_${negotiationId}`).emit("userTyping", {
      negotiationId,
      userId: socket.user.id, // always use verified server-side id
      isTyping,
    });

    // Track active typing rooms so we can auto-clear on disconnect
    if (isTyping) {
      socket._typingRooms = socket._typingRooms || new Set();
      socket._typingRooms.add(negotiationId);
    } else if (socket._typingRooms) {
      socket._typingRooms.delete(negotiationId);
    }
  });

  socket.on("sendNotification", ({ userId, notification }) => {
    const socketId = onlineUsers[userId];
    if (socketId) {
      io.to(socketId).emit("receiveNotification", notification);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);

    // Auto-clear any active typing indicators for this socket
    if (socket.user && socket._typingRooms?.size > 0) {
      socket._typingRooms.forEach((negotiationId) => {
        socket.to(`negotiation_${negotiationId}`).emit("userTyping", {
          negotiationId,
          userId: socket.user.id,
          isTyping: false,
        });
      });
    }

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

// ================= GLOBAL ERROR HANDLER =================
// Must be the LAST app.use() — catches any error forwarded via next(err).
// Existing try/catch blocks that respond manually are unaffected.
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 AgroBridge Server running on port ${PORT}`);
});
