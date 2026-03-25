const Transaction = require("../models/Transaction");


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
        select: "paddyType quantityKg pricePerKg location"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ transactions });

  } catch (error) {
    res.status(500).json({ message: error.message });
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
      .populate("listing")
      .populate("negotiation");

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    // 🔒 Security
    if (
      req.user.id !== transaction.farmer._id.toString() &&
      req.user.id !== transaction.millOwner._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    res.status(200).json({ transaction });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= MARK AS PAID =================
const markAsPaid = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    // Only mill owner (buyer) can pay
    if (req.user.id !== transaction.millOwner.toString()) {
      return res.status(403).json({
        message: "Only buyer can make payment"
      });
    }

    if (transaction.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "Already paid"
      });
    }

    transaction.paymentStatus = "PAID";
    transaction.status = "IN_PROGRESS";

    await transaction.save();

    res.status(200).json({
      message: "Payment successful",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= REQUEST TRANSPORT =================
const requestTransport = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (transaction.paymentStatus !== "PAID") {
      return res.status(400).json({
        message: "Complete payment first"
      });
    }

    transaction.transportRequired = true;
    transaction.transportStatus = "PENDING";

    await transaction.save();

    res.status(200).json({
      message: "Transport requested",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= START TRANSPORT =================
const startTransport = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (transaction.transportStatus !== "PENDING") {
      return res.status(400).json({
        message: "Transport not ready to start"
      });
    }

    transaction.transportStatus = "IN_PROGRESS";

    await transaction.save();

    res.status(200).json({
      message: "Transport started",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= MARK AS DELIVERED =================
const markDelivered = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (transaction.transportStatus !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Transport not in progress"
      });
    }

    transaction.transportStatus = "DELIVERED";
    transaction.status = "COMPLETED";

    await transaction.save();

    res.status(200).json({
      message: "Order completed",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  getMyTransactions,
  getTransactionById,
  markAsPaid,
  requestTransport,
  startTransport,
  markDelivered
};