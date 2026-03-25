const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // Unique order number for UI
    orderNumber: {
      type: String,
      unique: true,
    },

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

    // ================= PAYMENT =================
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    // ================= TRANSPORT =================
    transportRequired: {
      type: Boolean,
      default: false,
    },

    transportStatus: {
      type: String,
      enum: ["NOT_REQUIRED", "PENDING", "IN_PROGRESS", "DELIVERED"],
      default: "NOT_REQUIRED",
    },

    // ================= ORDER STATUS =================
    status: {
      type: String,
      enum: ["ORDER_CREATED", "IN_PROGRESS", "COMPLETED"],
      default: "ORDER_CREATED",
    },
  },
  {
    timestamps: true,
  }
);

// ================= GENERATE ORDER NUMBER =================
transactionSchema.pre("save", function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `AGB-${timestamp}`;
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);