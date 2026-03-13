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

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    // Transport required or not
    transportRequired: {
      type: Boolean,
      default: false,
    },

    // Order lifecycle
    status: {
      type: String,
      enum: [
        "ORDER_CREATED",
        "PAYMENT_PENDING",
        "PAYMENT_COMPLETED",
        "TRANSPORT_SCHEDULED",
        "IN_TRANSPORT",
        "DELIVERED",
        "COMPLETED",
      ],
      default: "ORDER_CREATED",
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number automatically
transactionSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `AGB-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);