const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    platformFeePercentage: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 100,
    },
    autoDisputeDays: {
      type: Number,
      default: 3,
      min: 1,
      max: 30,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxListingsPerUser: {
      type: Number,
      default: 20,
    },
    supportEmail: {
      type: String,
      default: "support@agrobridge.lk",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
