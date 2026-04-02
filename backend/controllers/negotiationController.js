const Negotiation = require("../models/Negotiation");
const Listing = require("../models/Listing");
const Transaction = require("../models/Transaction");
const Transport = require("../models/Transport");
const Notification = require("../models/Notification");
const SystemSetting = require("../models/SystemSetting");


// =============================
// CREATE NEGOTIATION
// =============================
const createNegotiation = async (req, res) => {

  try {

    const { listingId, message, offeredPrice, quantityKg } = req.body;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.status !== "ACTIVE") {
      return res.status(400).json({
        message: "This listing is not active"
      });
    }

    let farmerId, millOwnerId;

    if (listing.listingType === "SELL") {
      farmerId = listing.owner;
      millOwnerId = req.user.id;
    } else {
      farmerId = req.user.id;
      millOwnerId = listing.owner;
    }

    // Prevent duplicate negotiation between same farmer and mill owner for this listing
    const existing = await Negotiation.findOne({
      listing: listingId,
      farmer: farmerId,
      millOwner: millOwnerId
    });

    if (existing) {
  return res.status(200).json({
    message: "Existing negotiation",
    negotiation: existing
  });
}

    const negotiation = new Negotiation({
      listing: listingId,
      farmer: farmerId,
      millOwner: millOwnerId,
      status: "OPEN",
      messages: [
        {
          sender: req.user.id,
          message: message || "Offer submitted",
          offeredPrice,
          quantityKg,
          type: "OFFER"
        }
      ],
      lastMessage: message
    });

    await negotiation.save();
    if (global.io) {
      global.io.emit("dashboard_update");
    }

    // Notify farmer
    await Notification.create({
      user: listing.owner,
      title: "New Negotiation",
      message: "A mill owner started negotiation on your listing"
    });

    res.status(201).json({
      message: "Negotiation started",
      negotiation
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


// =============================
// GET USER NEGOTIATIONS
// =============================
const getNegotiations = async (req, res) => {

  try {

    const negotiations = await Negotiation.find({
      $or: [
        { farmer: req.user.id },
        { millOwner: req.user.id }
      ]
    })
      .populate("farmer", "fullName")
      .populate("millOwner", "fullName businessDetails")
      .populate("listing", "paddyType quantityKg availableQuantityKg pricePerKg location status")
      .sort({ updatedAt: -1 });

    res.status(200).json({ negotiations });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


// =============================
// GET SINGLE NEGOTIATION
// =============================
const getNegotiationById = async (req, res) => {

  try {

    const negotiation = await Negotiation.findById(req.params.id)
      .populate("farmer", "fullName")
      .populate("millOwner", "fullName businessDetails")
      .populate("messages.sender", "fullName")
      .populate("listing");

    if (!negotiation) {
      return res.status(404).json({
        message: "Negotiation not found"
      });
    }

    res.status(200).json({ negotiation });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


// =============================
// ADD MESSAGE
// =============================
const addMessage = async (req, res) => {

  try {

    const { message, offeredPrice, quantityKg } = req.body;

    const negotiation = await Negotiation.findById(req.params.id);

    if (!negotiation) {
      return res.status(404).json({
        message: "Negotiation not found"
      });
    }

    if (negotiation.status !== "OPEN") {
      return res.status(400).json({
        message: "Negotiation is already closed"
      });
    }

    if (
      req.user.id !== negotiation.farmer.toString() &&
      req.user.id !== negotiation.millOwner.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized for this negotiation"
      });
    }

    const newMessage = {
      sender: req.user.id,
      message: message || "Offer update",
      offeredPrice,
      quantityKg,
      type: offeredPrice ? "COUNTER" : "MESSAGE"
    };

    negotiation.messages.push(newMessage);
    negotiation.lastMessage = newMessage.message;

    await negotiation.save();
    if (global.io) {
      global.io.emit("dashboard_update");
    }
    
    await negotiation.populate("farmer", "fullName");
    await negotiation.populate("millOwner", "fullName businessDetails");
    await negotiation.populate("messages.sender", "fullName");
    await negotiation.populate("listing");

    res.status(200).json({
      message: "Message sent",
      negotiation
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


// =============================
// UPDATE NEGOTIATION STATUS
// =============================
const updateNegotiationStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const negotiation = await Negotiation.findById(req.params.id)
      .populate("listing");

    if (!negotiation) {
      return res.status(404).json({
        message: "Negotiation not found"
      });
    }

    if (negotiation.status !== "OPEN") {
      return res.status(400).json({
        message: "Negotiation already closed"
      });
    }

    negotiation.status = status;

    negotiation.messages.push({
      sender: req.user.id,
      message: `Negotiation ${status.toLowerCase()}`,
      type: "SYSTEM"
    });

    // =============================
    // ACCEPTED → CREATE TRANSACTION
    // =============================
    if (status === "ACCEPTED") {

      const listing = await Listing.findById(negotiation.listing._id);

      const existingTransaction = await Transaction.findOne({ listing: listing._id });
      if (existingTransaction) {
        return res.status(400).json({
          message: "This listing is already sold"
        });
      }

      const lastOffer = negotiation.messages
        .filter(m => m.offeredPrice)
        .slice(-1)[0];

      const latestQuantityOffer = negotiation.messages
        .slice().reverse()
        .find(m => m.quantityKg);

      const finalPrice = lastOffer?.offeredPrice || listing.pricePerKg;
      const quantity = lastOffer?.quantityKg || latestQuantityOffer?.quantityKg || listing.availableQuantityKg;

      if (quantity > listing.availableQuantityKg) {
        return res.status(400).json({
          message: "Not enough paddy available"
        });
      }

      const totalAmount = finalPrice * quantity;

      // Platform fee from system settings
      const settings = await SystemSetting.findOne();
      const feePercent = settings?.platformFeePercentage ?? 5;
      const platformFee = parseFloat(((totalAmount * feePercent) / 100).toFixed(2));

      // Reduce listing stock
      listing.availableQuantityKg -= quantity;

      listing.status = "CLOSED";

      await listing.save();

      // Create transaction
      const transaction = await Transaction.create({
        negotiation: negotiation._id,
        listing: listing._id,
        farmer: negotiation.farmer,
        millOwner: negotiation.millOwner,
        finalPricePerKg: finalPrice,
        quantityKg: quantity,
        totalAmount: totalAmount,
        platformFee: platformFee,
        status: "ORDER_CREATED"
      });

      // Create transport request
      

      // Notifications
      await Notification.create({
        user: negotiation.farmer,
        title: "Deal Confirmed",
        message: "Your negotiation has been accepted"
      });

      await Notification.create({
        user: negotiation.millOwner,
        title: "Deal Accepted",
        message: "The farmer accepted your offer"
      });

    }

    await negotiation.save();
    if (global.io) {
      global.io.emit("dashboard_update");
    }

    await negotiation.populate("farmer", "fullName");
    await negotiation.populate("millOwner", "fullName businessDetails");
    await negotiation.populate("messages.sender", "fullName");
    await negotiation.populate("listing");
    
    if (global.io) {
      global.io.to(negotiation._id.toString()).emit("receiveStatusUpdate", {
        negotiationId: negotiation._id.toString(),
        status: negotiation.status,
        systemMessage: negotiation.messages[negotiation.messages.length - 1]
      });
    }

    res.status(200).json({
      message: "Negotiation status updated",
      negotiation
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


// =============================
// DELETE MESSAGE
// =============================
const deleteMessage = async (req, res) => {
  try {
    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    const message = negotiation.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Cannot delete another user's message" });
    }

    message.isDeleted = true;
    await negotiation.save();
    if (global.io) {
      global.io.emit("dashboard_update");
    }

    await negotiation.populate("farmer", "fullName");
    await negotiation.populate("millOwner", "fullName businessDetails");
    await negotiation.populate("messages.sender", "fullName");
    await negotiation.populate("listing");

    res.status(200).json({ message: "Message deleted successfully", negotiation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// MARK MESSAGES AS READ
// =============================
const markMessagesRead = async (req, res) => {
  try {
    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    let updated = false;
    negotiation.messages.forEach(msg => {
      // If someone else sent it, and it isn't READ yet
      if (msg.sender.toString() !== req.user.id && msg.status !== "READ") {
        msg.status = "READ";
        updated = true;
      }
    });

    if (updated) {
      await negotiation.save();
    if (global.io) {
      global.io.emit("dashboard_update");
    }
    }

    await negotiation.populate("farmer", "fullName");
    await negotiation.populate("millOwner", "fullName businessDetails");
    await negotiation.populate("messages.sender", "fullName");
    await negotiation.populate("listing");

    res.status(200).json({ message: "Messages marked as read", negotiation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// EDIT MESSAGE
// =============================
const editMessage = async (req, res) => {
  try {
    const { newText } = req.body;
    if (!newText?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    const message = negotiation.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Cannot edit another user's message" });
    }
    
    if (message.type !== "MESSAGE") {
      return res.status(400).json({ message: "Cannot edit offer or system messages" });
    }
    
    if (message.isDeleted) {
      return res.status(400).json({ message: "Cannot edit a deleted message" });
    }

    message.message = newText;
    message.isEdited = true;
    await negotiation.save();
    if (global.io) {
      global.io.emit("dashboard_update");
    }

    await negotiation.populate("farmer", "fullName");
    await negotiation.populate("millOwner", "fullName businessDetails");
    await negotiation.populate("messages.sender", "fullName");
    await negotiation.populate("listing");

    res.status(200).json({ message: "Message edited successfully", negotiation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createNegotiation,
  getNegotiations,
  getNegotiationById,
  addMessage,
  updateNegotiationStatus,
  deleteMessage,
  markMessagesRead,
  editMessage
};