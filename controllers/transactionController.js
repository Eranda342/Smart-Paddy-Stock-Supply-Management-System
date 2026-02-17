const Transaction = require("../models/Transaction");
const Negotiation = require("../models/Negotiation");
const Listing = require("../models/Listing");

const confirmTransaction = async (req, res) => {
  try {
    const { negotiationId, finalPricePerKg, transportRequired } = req.body;

    // Find negotiation
    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    // Update negotiation status
    negotiation.status = "AGREED";
    await negotiation.save();

    // Find listing
    const listing = await Listing.findById(negotiation.listing);

    // Close listing
    listing.status = "CLOSED";
    await listing.save();

    // Calculate total
    const totalAmount = finalPricePerKg * listing.quantityKg;

    // Create transaction
    const transaction = new Transaction({
      negotiation: negotiation._id,
      listing: listing._id,
      farmer: negotiation.farmer,
      millOwner: negotiation.millOwner,
      finalPricePerKg,
      quantityKg: listing.quantityKg,
      totalAmount,
      transportRequired,
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction confirmed successfully",
      transaction,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { confirmTransaction };
