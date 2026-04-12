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
    default: null
  },

  nic: {
    type: String,
    default: null
  },

  // ── Google OAuth – optional, only set for Google-authenticated accounts ──
  googleId: {
    type: String,
    default: null
  },

  password: {
    type: String,
    required: false, // Not required for Google OAuth users
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

  emailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  emailVerificationExpire: Date,

  isBlocked: {
    type: Boolean,
    default: false
  },

  profileImage: {
    type: String,
    default: null
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,


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
    },

    rejectionReason: {
      type: String,
      default: null
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

    millCapacity: {
      type: Number
    },

    businessPhone: {
      type: String
    },

    businessDocument: {
      type: String
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    rejectionReason: {
      type: String,
      default: null
    }

  }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);