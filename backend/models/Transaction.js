const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    negotiation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Negotiation",
      required: true,
    },

    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    millOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    finalPricePerKg: {
      type: Number,
      required: true,
    },

    quantityKg: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    transportRequired: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["CONFIRMED", "COMPLETED"],
      default: "CONFIRMED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
