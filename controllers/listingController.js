const Listing = require("../models/Listing");
const User = require("../models/User");

const createListing = async (req, res) => {
  try {
    const { ownerId, listingType, paddyType, quantityKg, pricePerKg, district, address } = req.body;

    // Check if user exists
    const user = await User.findById(ownerId);

    if (!user) {
      return res.status(404).json({ message: "Owner not found" });
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
