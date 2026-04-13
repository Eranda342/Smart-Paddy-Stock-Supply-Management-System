const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { transactionSuccessTemplate, transportAssignedTemplate } = require("../utils/emailTemplates");


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
      .populate("negotiation")
      .populate("vehicle");

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
    if (global.io) {
      global.io.emit("dashboard_update");
    }

    // --- SEND TRANSACTION EMAILS ---
    try {
      const farmerUser = await User.findById(transaction.farmer);
      const millOwnerUser = await User.findById(transaction.millOwner);
      const tempTransaction = await Transaction.findById(transaction._id).populate("listing", "paddyType");
      
      const emailData = {
        farmerName: farmerUser?.fullName || "Farmer",
        millOwnerName: millOwnerUser?.fullName || "Mill Owner",
        paddyType: tempTransaction?.listing?.paddyType || "Paddy",
        quantity: transaction.quantityKg,
        pricePerKg: transaction.finalPricePerKg,
        totalAmount: transaction.totalAmount
      };

      if (farmerUser && farmerUser.email) {
        await sendEmail({
          to: farmerUser.email,
          subject: "Transaction Successful - AgroBridge",
          html: transactionSuccessTemplate({ ...emailData, role: 'FARMER' })
        });
      }

      if (millOwnerUser && millOwnerUser.email) {
        await sendEmail({
          to: millOwnerUser.email,
          subject: "Transaction Successful - AgroBridge",
          html: transactionSuccessTemplate({ ...emailData, role: 'MILL_OWNER' })
        });
      }
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }
    // -------------------------------

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
    if (global.io) {
      global.io.emit("dashboard_update");
    }

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
    if (global.io) {
      global.io.emit("dashboard_update");
    }

    res.status(200).json({
      message: "Transport started",
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
    if (global.io) {
      global.io.emit("dashboard_update");
    }

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
    if (global.io) {
      global.io.emit("dashboard_update");
    }

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
    if (global.io) {
      global.io.emit("dashboard_update");
    }

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

    const { vehicleId, vehicleNumber: manualNumber, vehicleType: manualType } = req.body;

    let resolvedVehicleNumber = manualNumber;
    let resolvedVehicleType = manualType;
    let resolvedDriverName = "N/A";
    let resolvedDriverPhone = "N/A";

    if (vehicleId) {
      const Vehicle = require("../models/Vehicle");
      const vehicleDoc = await Vehicle.findById(vehicleId);
      if (!vehicleDoc) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      resolvedVehicleNumber = vehicleDoc.vehicleNumber;
      resolvedVehicleType = vehicleDoc.type;
      resolvedDriverName = vehicleDoc.driverName || "N/A";
      resolvedDriverPhone = vehicleDoc.driverPhone || "N/A";
      transaction.vehicle = vehicleId;
    }

    if (!resolvedVehicleNumber || !resolvedVehicleType) {
      return res.status(400).json({
        message: "Vehicle number and type are required"
      });
    }

    transaction.transportStatus = "IN_PROGRESS";
    transaction.vehicleDetails = {
      vehicleNumber: resolvedVehicleNumber,
      vehicleType: resolvedVehicleType
    };

    await transaction.save();
    
    // --- Create Transport Record Non-Blocking ---
    try {
      const Transport = require("../models/Transport");
      await Transport.create({
        vehicleType: resolvedVehicleType,
        driverName: resolvedDriverName,
        driverPhone: resolvedDriverPhone,
        transactions: [transaction._id],
        status: "ASSIGNED"
      });
    } catch (transportErr) {
      console.error("Failed to create transport record:", transportErr);
    }
    // ---------------------------------------------

    // --- SEND TRANSPORT EMAIL ---
    try {
      const farmerUser = await User.findById(transaction.farmer);
      const tempTransaction = await Transaction.findById(transaction._id).populate("listing", "paddyType");
      
      if (farmerUser && farmerUser.email) {
         await sendEmail({
           to: farmerUser.email,
           subject: "Transport Assigned - AgroBridge",
           html: transportAssignedTemplate({
             farmerName: farmerUser.fullName,
             vehicleNumber: resolvedVehicleNumber,
             driverName: resolvedDriverName,
             driverPhone: resolvedDriverPhone,
             paddyType: tempTransaction?.listing?.paddyType || "Paddy",
             quantity: transaction.quantityKg
           })
         });
      }
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }
    // ----------------------------

    if (global.io) {
      global.io.emit("dashboard_update");
    }

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const millOwnerUser = await User.findById(req.user.id).select("fullName");

    const newNotification = await Notification.create({
      user: transaction.farmer,
      message: "Vehicle has been assigned 🚛",
      type: "VEHICLE_ASSIGNED",
      transactionId: transaction._id
    });

    if (onlineUsers[transaction.farmer]) {
      io.to(onlineUsers[transaction.farmer]).emit("receiveNotification", newNotification);
    }

    res.status(200).json({
      message: "Transport assigned successfully",
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ===== FARMER: CONFIRM PICKUP =====
const confirmPickup = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Only farmer can confirm pickup
    if (transaction.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    transaction.pickupConfirmed = true;
    transaction.pickupTime = new Date();
    transaction.transportStatus = "IN_PROGRESS";   // valid enum value
    transaction.status = "DELIVERY_IN_PROGRESS";   // ✅ valid enum value

    await transaction.save();
    if (global.io) {
      global.io.emit("dashboard_update");
    }

    const updated = await Transaction.findById(transaction._id).populate("vehicle");

    const newNotification = await Notification.create({
      user: transaction.millOwner,
      message: "Pickup confirmed 📦",
      type: "PICKUP_CONFIRMED",
      transactionId: transaction._id
    });

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    if (onlineUsers[transaction.millOwner]) {
      io.to(onlineUsers[transaction.millOwner]).emit("receiveNotification", newNotification);
    }

    res.json({
      message: "Pickup confirmed",
      transaction: updated
    });

  } catch (error) {
    console.error("PICKUP ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// ===== CONFIRM DELIVERY (dual-path: mill owner for transport, farmer for self-delivery) =====
const markDelivered = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.transportRequired === true) {
      // Transport was used → only the mill owner of this transaction can confirm receipt
      if (transaction.millOwner.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized: only mill owner can confirm delivery for transport orders" });
      }
    } else {
      // Self-delivery → only the farmer of this transaction can confirm
      if (transaction.farmer.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized: only farmer can confirm self-delivery" });
      }
    }

    transaction.transportStatus = "DELIVERED";
    transaction.status = "COMPLETED";
    transaction.deliveryConfirmed = true;
    transaction.deliveredTime = new Date();

    await transaction.save();
    if (global.io) {
      global.io.emit("dashboard_update");
    }

    const updated = await Transaction.findById(transaction._id).populate("vehicle");

    const newNotification = await Notification.create({
      user: transaction.farmer,
      message: "Your paddy has been delivered ✅",
      type: "DELIVERED",
      transactionId: transaction._id
    });

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    if (onlineUsers[transaction.farmer]) {
      io.to(onlineUsers[transaction.farmer]).emit("receiveNotification", newNotification);
    }

    res.json({
      message: "Delivery confirmed",
      transaction: updated
    });

  } catch (error) {
    console.error("DELIVERY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  getMyTransactions,
  getTransactionById,
  markAsPaid,
  requestTransport,
  startTransport,
  setTransportDecision,
  markAsDeliveredByFarmer,
  confirmDeliveryByMillOwner,
  assignTransport,
  confirmPickup,
  markDelivered
};