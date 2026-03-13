const Transaction = require("../models/Transaction");
const Negotiation = require("../models/Negotiation");
const Listing = require("../models/Listing");


// ================= CONFIRM TRANSACTION =================
// Create transaction after negotiation agreement

const confirmTransaction = async (req, res) => {

  try {

    const { negotiationId, finalPricePerKg, transportRequired } = req.body;

    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    // Prevent duplicate transactions
    const existingTransaction = await Transaction.findOne({
      negotiation: negotiationId
    });

    if (existingTransaction) {
      return res.status(400).json({
        message: "Transaction already created for this negotiation"
      });
    }

    // Only farmer or mill owner can confirm
    if (
      req.user.id !== negotiation.farmer.toString() &&
      req.user.id !== negotiation.millOwner.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to confirm this transaction"
      });
    }

    // Update negotiation status
    negotiation.status = "AGREED";
    await negotiation.save();

    // Get listing
    const listing = await Listing.findById(negotiation.listing);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Close listing
    listing.status = "CLOSED";
    await listing.save();

    // Calculate total amount
    const totalAmount = finalPricePerKg * listing.quantityKg;

    // Generate Order Number
    const orderNumber = "AGB-" + Date.now();

    // Create transaction
    const transaction = await Transaction.create({

      orderNumber,

      negotiation: negotiation._id,
      listing: listing._id,

      farmer: negotiation.farmer,
      millOwner: negotiation.millOwner,

      finalPricePerKg,
      quantityKg: listing.quantityKg,
      totalAmount,

      paymentStatus: "PENDING",

      transportRequired,

      status: "ORDER_CREATED"

    });

    res.status(201).json({
      message: "Transaction confirmed successfully",
      transaction
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// ================= GET USER TRANSACTIONS =================

const getMyTransactions = async (req, res) => {

  try {

    const transactions = await Transaction.find({
      $or: [
        { farmer: req.user.id },
        { millOwner: req.user.id }
      ]
    })
      .populate({
        path: "millOwner",
        select: "fullName businessDetails"
      })
      .populate({
        path: "farmer",
        select: "fullName"
      })
      .populate({
        path: "listing",
        select: "paddyType quantityKg pricePerKg"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      transactions
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// ================= GET SINGLE TRANSACTION =================

const getTransactionById = async (req, res) => {

  try {

    const transaction = await Transaction.findById(req.params.id)
      .populate({
        path: "farmer",
        select: "fullName phone"
      })
      .populate({
        path: "millOwner",
        select: "fullName phone businessDetails"
      })
      .populate({
        path: "listing"
      })
      .populate({
        path: "negotiation"
      });

    if (!transaction) {

      return res.status(404).json({
        message: "Transaction not found"
      });

    }

    res.status(200).json({
      transaction
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


module.exports = {
  confirmTransaction,
  getMyTransactions,
  getTransactionById
};