const Listing = require("../models/Listing");

// CREATE LISTING (Protected + Role Restricted)
const createListing = async (req, res) => {
  try {
    const {
      listingType,
      paddyType,
      quantityKg,
      pricePerKg,
      district,
      address,
    } = req.body;

    const ownerId = req.user.id;

    // Basic validation
    if (!listingType || !paddyType || !quantityKg || !pricePerKg || !district) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Role-based enforcement
    if (req.user.role === "FARMER" && listingType !== "SELL") {
      return res.status(403).json({
        message: "Farmers can only create SELL listings",
      });
    }

    if (req.user.role === "MILL_OWNER" && listingType !== "BUY") {
      return res.status(403).json({
        message: "Mill owners can only create BUY listings",
      });
    }

    const newListing = new Listing({
      owner: ownerId,
      listingType,
      paddyType,
      quantityKg,
      pricePerKg,
      location: {
        district,
        address,
      },
    });

    await newListing.save();

    res.status(201).json({
      message: "Listing created successfully",
      listing: newListing,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createListing };
