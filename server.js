const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);


// Test Route
app.get("/", (req, res) => {
    res.send("Smart Paddy Stock & Supply Management System API Running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
