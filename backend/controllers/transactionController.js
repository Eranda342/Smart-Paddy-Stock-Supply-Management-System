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
    transaction.status = "PAYMENT_COMPLETED";

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



// ================= SET TRANSPORT DECISION =================
const setTransportDecision = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (req.user.id !== transaction.farmer.toString()) {
      return res.status(403).json({
        message: "Only farmer can perform this action"
      });
    }

    if (transaction.paymentStatus !== "PAID") {
      return res.status(400).json({
        message: "Payment must be completed first"
      });
    }

    const { transportRequired } = req.body;
    transaction.transportRequired = transportRequired;

    if (transportRequired === true) {
      transaction.transportStatus = "PENDING";
    } else if (transportRequired === false) {
      transaction.transportStatus = "NOT_REQUIRED";
    }

    await transaction.save();

    res.status(200).json({
      message: "Transport decision saved",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= MARK DELIVERED BY FARMER =================
const markAsDeliveredByFarmer = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (req.user.id !== transaction.farmer.toString()) {
      return res.status(403).json({
        message: "Only farmer can perform this action"
      });
    }

    if (transaction.paymentStatus !== "PAID" || transaction.transportRequired !== false) {
      return res.status(400).json({
        message: "Invalid transaction state: Payment must be completed and transport not required."
      });
    }

    transaction.transportStatus = "DELIVERED";
    transaction.status = "DELIVERED";

    await transaction.save();

    res.status(200).json({
      message: "Order marked as delivered by farmer",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= CONFIRM DELIVERY BY MILL OWNER =================
const confirmDeliveryByMillOwner = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (req.user.id !== transaction.millOwner.toString()) {
      return res.status(403).json({
        message: "Only mill owner can perform this action"
      });
    }

    if (transaction.transportStatus !== "DELIVERED") {
      return res.status(400).json({
        message: "Transaction is not yet delivered"
      });
    }

    transaction.status = "COMPLETED";

    await transaction.save();

    res.status(200).json({
      message: "Delivery confirmed and order completed",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= ASSIGN TRANSPORT =================
const assignTransport = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (req.user.id !== transaction.millOwner.toString()) {
      return res.status(403).json({
        message: "Only mill owner can perform this action"
      });
    }

    if (
      transaction.paymentStatus !== "PAID" ||
      transaction.transportRequired !== true ||
      transaction.transportStatus !== "PENDING"
    ) {
      return res.status(400).json({
        message: "Invalid transaction state: Payment must be PAID, transport REQUIRED, and status PENDING."
      });
    }

    const { vehicleNumber, vehicleType } = req.body;

    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({
        message: "Vehicle number and type are required"
      });
    }

    transaction.transportStatus = "ASSIGNED";
    transaction.vehicleDetails = {
      vehicleNumber,
      vehicleType
    };

    await transaction.save();

    res.status(200).json({
      message: "Transport assigned successfully",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= MARK PICKED UP =================
const markPickedUp = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (req.user.id !== transaction.farmer.toString()) {
      return res.status(403).json({
        message: "Only farmer can perform this action"
      });
    }

    if (transaction.transportStatus !== "ASSIGNED") {
      return res.status(400).json({
        message: "Transport vehicle has not been assigned yet"
      });
    }

    transaction.transportStatus = "PICKED_UP";

    await transaction.save();

    res.status(200).json({
      message: "Marked as picked up",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= MARK TRANSPORT DELIVERED =================
const markTransportDelivered = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (req.user.id !== transaction.millOwner.toString()) {
      return res.status(403).json({
        message: "Only mill owner can perform this action"
      });
    }

    if (transaction.transportStatus !== "PICKED_UP") {
      return res.status(400).json({
        message: "Transport has not been picked up yet"
      });
    }

    transaction.transportStatus = "DELIVERED";
    transaction.status = "COMPLETED";

    await transaction.save();

    res.status(200).json({
      message: "Delivery completed via transport",
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
  markDelivered,
  setTransportDecision,
  markAsDeliveredByFarmer,
  confirmDeliveryByMillOwner,
  assignTransport,
  markPickedUp,
  markTransportDelivered
};