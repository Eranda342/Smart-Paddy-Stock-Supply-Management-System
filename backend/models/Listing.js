const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
{
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  listingType: {
    type: String,
    enum: ["SELL", "BUY"],
    required: true,
  },

  paddyType: {
    type: String,
    required: true,
  },

  quantityKg: {
    type: Number,
    required: true,
  },

  pricePerKg: {
    type: Number,
    required: true,
  },

  location: {
    district: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
  },

  description: {          
    type: String,
  },

  status: {
    type: String,
    enum: ["ACTIVE", "NEGOTIATING", "CLOSED"],
    default: "ACTIVE",
  },
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("Listing", listingSchema);