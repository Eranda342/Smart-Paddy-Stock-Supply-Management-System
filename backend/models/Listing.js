const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
{
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  listingType: {
    type: String,
    enum: ["SELL", "BUY"],
    required: true,
    index: true
  },

  paddyType: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  quantityKg: {
    type: Number,
    required: true,
    min: 1
  },

  availableQuantityKg: {
    type: Number,
    min: 0
  },

  pricePerKg: {
    type: Number,
    required: true,
    min: 1
  },

  location: {
    district: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    address: {
      type: String,
      trim: true
    }
  },

  description: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: ["ACTIVE", "SOLD", "FULFILLED", "CLOSED"],
    default: "ACTIVE",
    index: true
  }

},
{
  timestamps: true
}
);


/* ===============================
   Indexes for faster filtering
================================ */
listingSchema.index({ owner: 1, createdAt: -1 });
listingSchema.index({ listingType: 1, status: 1 });
listingSchema.index({ paddyType: 1, status: 1 });
listingSchema.index({ "location.district": 1, status: 1 });


/* ===============================
   Automatically set available quantity
================================ */
listingSchema.pre("save", function () {

  if (this.isNew) {
    this.availableQuantityKg = this.quantityKg;
  }

});


module.exports = mongoose.model("Listing", listingSchema);