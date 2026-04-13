const Transport = require("../models/Transport");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const sendSMS = require("../utils/sendSMS");


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

    // ── Non-blocking SMS notifications ─────────────────────────────────────
    // Fire-and-forget after response is already sent — never delays the client.
    (async () => {
      try {
        const locations = transport.pickupLocations || [];

        // Build a map: farmerId → quantityKg from transactions
        const txList = await Transaction.find({ _id: { $in: transactionIds } })
          .select("farmer quantityKg");
        const qtyMap = {};
        txList.forEach(tx => {
          const fid = String(tx.farmer);
          qtyMap[fid] = (qtyMap[fid] || 0) + (tx.quantityKg || 0);
        });

        await Promise.all(
          locations.map(async (loc) => {
            const farmerId = loc.farmer;
            if (!farmerId) return;

            // Fetch farmer details
            const farmer = await User.findById(farmerId).select("fullName phone");
            if (!farmer) return;

            const farmerName  = farmer.fullName  || "Farmer";
            const farmerPhone = farmer.phone      || null;
            const quantityKg  = qtyMap[String(farmerId)] || loc.quantityKg || "N/A";
            const district    = loc.district || "N/A";
            const address     = loc.address  || "N/A";

            // 1️⃣  Driver SMS — one per pickup location
            const driverMsg =
`AgroBridge 🚛

Pickup Assigned

Farmer: ${farmerName}
Quantity: ${quantityKg} kg
District: ${district}
Address: ${address}

Contact: ${farmerPhone || "N/A"}`;

            try {
              await sendSMS(driverPhone, driverMsg);
            } catch (err) {
              console.error("SMS failed (driver):", err.message);
            }

            // 2️⃣  Farmer SMS — only if we have a phone number
            if (farmerPhone) {
              const farmerMsg =
`AgroBridge 🌾

Your pickup is scheduled

Vehicle: ${vehicleType}
Driver: ${driverName}
Phone: ${driverPhone}`;

              try {
                await sendSMS(farmerPhone, farmerMsg);
              } catch (err) {
                console.error("SMS failed (farmer):", err.message);
              }
            }
          })
        );
      } catch (err) {
        console.error("SMS notification block failed:", err.message);
      }
    })();
    // ── End SMS ────────────────────────────────────────────────────────────


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


// ================= GET TRANSPORT DATA =================
// Returns active (IN_PROGRESS) and history (DELIVERED) for the logged-in user
const getTransport = async (req, res) => {
  try {
    const userId = req.user.id;

    const userFilter = {
      transportRequired: true,
      $or: [{ farmer: userId }, { millOwner: userId }]
    };

    const populateOpts = [
      { path: "farmer",    select: "fullName" },
      { path: "millOwner", select: "fullName businessDetails" },
      { path: "vehicle" }
    ];

    const [active, history] = await Promise.all([
      Transaction.find({ ...userFilter, transportStatus: "IN_PROGRESS" })
        .populate(populateOpts)
        .sort({ updatedAt: -1 }),

      Transaction.find({ ...userFilter, transportStatus: "DELIVERED" })
        .populate(populateOpts)
        .sort({ updatedAt: -1 })
    ]);

    res.json({ active, history });

  } catch (error) {
    console.error("GET TRANSPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createTransport,
  getTransport
};