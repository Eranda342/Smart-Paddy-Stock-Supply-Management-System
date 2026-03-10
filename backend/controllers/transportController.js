const Transport = require("../models/Transport");
const Transaction = require("../models/Transaction");

const createTransport = async (req, res) => {
  try {
    const {
      vehicleType,
      driverName,
      driverPhone,
      transactionIds,
      pickupLocations,
    } = req.body;

    // Verify transactions exist
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
    });

    if (transactions.length !== transactionIds.length) {
      return res.status(404).json({ message: "One or more transactions not found" });
    }

    const transport = new Transport({
      vehicleType,
      driverName,
      driverPhone,
      transactions: transactionIds,
      pickupLocations,
    });

    await transport.save();

    res.status(201).json({
      message: "Transport scheduled successfully",
      transport,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTransport };
