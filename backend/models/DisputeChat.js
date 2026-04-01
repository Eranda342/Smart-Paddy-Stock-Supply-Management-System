const mongoose = require("mongoose");

const disputeChatSchema = new mongoose.Schema(
  {
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispute",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DisputeChat", disputeChatSchema);
