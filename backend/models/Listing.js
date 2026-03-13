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

  availableQuantityKg: {
    type: Number,
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

/* Indexes for faster filtering */
listingSchema.index({ owner: 1 });
listingSchema.index({ listingType: 1 });
listingSchema.index({ paddyType: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ "location.district": 1 });

/* Automatically set available quantity */
listingSchema.pre("save", function (next) {
  if (!this.availableQuantityKg) {
    this.availableQuantityKg = this.quantityKg;
  }
  next();
});

module.exports = mongoose.model("Listing", listingSchema);