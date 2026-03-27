const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  vehicleNumber: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["Truck", "Lorry", "Van"],
    required: true
  },

  capacityKg: {
    type: Number,
    required: true
  },

  driverName: {
    type: String,
    required: true
  },

  driverPhone: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["ACTIVE", "MAINTENANCE"],
    default: "ACTIVE"
  }

}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
