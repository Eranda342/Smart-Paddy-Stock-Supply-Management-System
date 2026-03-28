/**
 * seedAdmin.js — Run once to create the admin account
 * Usage: node seedAdmin.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

const ADMIN = {
  fullName: "Admin User",
  email: "admin@agrobridge.com",
  phone: "0000000000",
  nic: "000000000V",
  password: "admin123",
  role: "ADMIN",
  isVerified: true
};

(async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log("⚠️  Admin already exists:", existing.email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN.password, salt);

    const admin = await User.create({
      ...ADMIN,
      password: hashedPassword
    });

    console.log("✅ Admin created successfully!");
    console.log("   Email   :", admin.email);
    console.log("   Role    :", admin.role);
    console.log("   Password: admin123 (change after first login)");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
})();
