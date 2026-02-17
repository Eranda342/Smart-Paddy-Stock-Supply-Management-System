const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    vehicleType: {
      type: String,
      required: true,
    },

    driverName: {
      type: String,
      required: true,
    },

    driverPhone: {
      type: String,
      required: true,
    },

    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],

    pickupLocations: [
      {
        farmer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        district: String,
        address: String,
      },
    ],

    status: {
      type: String,
      enum: ["SCHEDULED", "IN_TRANSIT", "DELIVERED"],
      default: "SCHEDULED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transport", transportSchema);
