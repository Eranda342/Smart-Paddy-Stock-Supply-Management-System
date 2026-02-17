const Negotiation = require("../models/Negotiation");
const Listing = require("../models/Listing");
const User = require("../models/User");

// Create negotiation
const createNegotiation = async (req, res) => {
  try {
    const { listingId, farmerId, millOwnerId, message, offeredPrice } = req.body;

    // Check listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const negotiation = new Negotiation({
      listing: listingId,
      farmer: farmerId,
      millOwner: millOwnerId,
      messages: [
        {
          sender: millOwnerId,
          message,
          offeredPrice,
        },
      ],
    });

    await negotiation.save();

    res.status(201).json({
      message: "Negotiation started",
      negotiation,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add message
const addMessage = async (req, res) => {
  try {
    const { senderId, message, offeredPrice } = req.body;

    const negotiation = await Negotiation.findById(req.params.id);

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    negotiation.messages.push({
      sender: senderId,
      message,
      offeredPrice,
    });

    await negotiation.save();

    res.status(200).json({
      message: "Message added",
      negotiation,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNegotiation, addMessage };
