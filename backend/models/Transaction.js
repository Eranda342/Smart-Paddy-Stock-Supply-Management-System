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

    platformFee: {
      type: Number,
      default: 0,
    },

    // ================= PAYMENT =================
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    // ================= TRANSPORT =================

    // Farmer decision
    transportRequired: {
      type: Boolean,
      default: null, // null = not decided yet
    },

    // Transport lifecycle
    transportStatus: {
      type: String,
      enum: [
        "NOT_DECIDED",   // waiting for farmer decision
        "NOT_REQUIRED",  // farmer said NO
        "PENDING",       // farmer said YES, waiting for vehicle
        "IN_PROGRESS",   // vehicle appointed/picking up
        "DELIVERED"      // delivered to mill
      ],
      default: "NOT_DECIDED",
    },

    pickupConfirmed: {
      type: Boolean,
      default: false,
    },

    pickupTime: {
      type: Date,
      default: null
    },

    deliveryConfirmed: {
      type: Boolean,
      default: false,
    },

    deliveredTime: {
      type: Date,
      default: null
    },

    vehicleDetails: {
      vehicleNumber: String,
      vehicleType: String
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle"
    },

    // ================= ORDER STATUS =================
    status: {
      type: String,
      enum: [
        "ORDER_CREATED",
        "PAYMENT_COMPLETED",
        "DELIVERY_IN_PROGRESS",
        "DELIVERED",
        "COMPLETED"
      ],
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