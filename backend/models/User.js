const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  // ================= BASIC ACCOUNT INFO =================
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String,
    required: true
  },

  nic: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ["FARMER", "MILL_OWNER", "ADMIN"],
    required: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },


  // ================= FARMER DETAILS =================
  farmDetails: {

    operatingDistrict: {
      type: String
    },

    landSize: {
      type: Number
    },

    paddyTypesCultivated: [
      {
        type: String
      }
    ],

    estimatedMonthlyStock: {
      type: Number
    },

    landDocument: {
      type: String
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }

  },


  // ================= MILL OWNER BUSINESS DETAILS =================
  businessDetails: {

    businessName: {
      type: String
    },

    businessRegistrationNumber: {
      type: String
    },

    millLocation: {
      type: String
    },

    businessDocument: {
      type: String
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }

  }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);