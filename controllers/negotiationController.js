const Negotiation = require("../models/Negotiation");
const Listing = require("../models/Listing");

// CREATE NEGOTIATION
const createNegotiation = async (req, res) => {
  try {
    const { listingId, message, offeredPrice } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const negotiation = new Negotiation({
      listing: listingId,
      farmer: listing.owner,
      millOwner: req.user.id,
      messages: [
        {
          sender: req.user.id,
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

// ADD MESSAGE
const addMessage = async (req, res) => {
  try {
    const { message, offeredPrice } = req.body;

    const negotiation = await Negotiation.findById(req.params.id);

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    // Only involved users can send message
    if (
      req.user.id !== negotiation.farmer.toString() &&
      req.user.id !== negotiation.millOwner.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized for this negotiation",
      });
    }

    negotiation.messages.push({
      sender: req.user.id,
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
