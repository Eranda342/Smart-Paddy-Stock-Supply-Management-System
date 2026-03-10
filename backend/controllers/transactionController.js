const Transaction = require("../models/Transaction");
const Negotiation = require("../models/Negotiation");
const Listing = require("../models/Listing");

const confirmTransaction = async (req, res) => {
  try {
    const { negotiationId, finalPricePerKg, transportRequired } = req.body;

    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    // Only involved users can confirm
    if (
      req.user.id !== negotiation.farmer.toString() &&
      req.user.id !== negotiation.millOwner.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to confirm this transaction",
      });
    }

    negotiation.status = "AGREED";
    await negotiation.save();

    const listing = await Listing.findById(negotiation.listing);
    listing.status = "CLOSED";
    await listing.save();

    const totalAmount = finalPricePerKg * listing.quantityKg;

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
