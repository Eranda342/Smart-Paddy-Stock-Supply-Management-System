const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Database connection
const connectDB = require("./config/db");

// Route imports
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const negotiationRoutes = require("./routes/negotiationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const transportRoutes = require("./routes/transportRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("AgroBridge API is running");
});

// ================= ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transports", transportRoutes);
app.use("/api/admin", adminRoutes);

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});