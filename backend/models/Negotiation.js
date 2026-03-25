const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  offeredPrice: {
    type: Number,
  },

  quantityKg: {
    type: Number,
  },

  type: {
    type: String,
    enum: ["MESSAGE", "OFFER", "COUNTER", "SYSTEM"],
    default: "MESSAGE",
  },

  status: {
    type: String,
    enum: ["SENT", "DELIVERED", "READ"],
    default: "SENT",
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },

  isEdited: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const negotiationSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    millOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    messages: [messageSchema],

    lastMessage: {
      type: String,
    },

    status: {
      type: String,
      enum: ["OPEN", "AGREED", "ACCEPTED", "REJECTED", "CANCELLED"],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Negotiation", negotiationSchema);