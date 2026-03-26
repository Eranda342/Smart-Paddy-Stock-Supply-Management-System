const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: String,
  message: String,
  senderName: String,

  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction"
  },

  read: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);