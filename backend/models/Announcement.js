const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    target: { type: String, enum: ["ALL", "FARMER", "MILL_OWNER"], required: true },
    count: { type: Number, default: 0 },
    status: { type: String, default: "SENT" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
