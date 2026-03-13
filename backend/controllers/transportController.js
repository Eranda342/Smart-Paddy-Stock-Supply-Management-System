const Transport = require("../models/Transport");
const Transaction = require("../models/Transaction");


// CREATE TRANSPORT
const createTransport = async (req, res) => {
  try {

    const {
      vehicleType,
      driverName,
      driverPhone,
      transactionIds,
      pickupLocations
    } = req.body;


    // Basic validation
    if (!transactionIds || transactionIds.length === 0) {
      return res.status(400).json({
        message: "No transactions provided"
      });
    }


    // Verify transactions exist
    const transactions = await Transaction.find({
      _id: { $in: transactionIds }
    });


    if (transactions.length !== transactionIds.length) {
      return res.status(404).json({
        message: "One or more transactions not found"
      });
    }


    // Check if any transaction already assigned to transport
    const existingTransport = await Transport.findOne({
      transactions: { $in: transactionIds }
    });


    if (existingTransport) {
      return res.status(400).json({
        message: "One or more transactions already scheduled for transport"
      });
    }


    // Create transport record
    const transport = new Transport({
      vehicleType,
      driverName,
      driverPhone,
      transactions: transactionIds,
      pickupLocations
    });


    await transport.save();


    // Update transaction status
    await Transaction.updateMany(
      { _id: { $in: transactionIds } },
      { status: "IN_TRANSPORT" }
    );


    // Populate response data
    const populatedTransport = await Transport.findById(transport._id)
      .populate({
        path: "transactions",
        populate: [
          { path: "farmer", select: "name" },
          { path: "millOwner", select: "name" },
          { path: "listing" }
        ]
      });


    res.status(201).json({
      message: "Transport scheduled successfully",
      transport: populatedTransport
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


module.exports = {
  createTransport
};