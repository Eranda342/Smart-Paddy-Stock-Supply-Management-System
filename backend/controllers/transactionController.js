const Transaction = require("../models/Transaction");


// ================= GET USER TRANSACTIONS =================
// Get all transactions for logged-in user

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
// Get detailed transaction info

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

    // 🔒 Security: Only involved users can access
    if (
      req.user.id !== transaction.farmer.toString() &&
      req.user.id !== transaction.millOwner.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to view this transaction"
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
  getMyTransactions,
  getTransactionById
};