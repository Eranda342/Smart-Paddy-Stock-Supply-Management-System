const Listing = require("../models/Listing");
const SystemSetting = require("../models/SystemSetting");


// CREATE LISTING
const createListing = async (req, res, next) => {
  try {

    const {
      listingType,
      paddyType,
      quantityKg,
      pricePerKg,
      district,
      address,
      description
    } = req.body;

    const ownerId = req.user.id;

    if (!listingType || !paddyType || !quantityKg || !pricePerKg || !district) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    // Role restrictions
    if (req.user.role === "FARMER" && listingType !== "SELL") {
      return res.status(403).json({
        message: "Farmers can only create SELL listings"
      });
    }

    if (req.user.role === "MILL_OWNER" && listingType !== "BUY") {
      return res.status(403).json({
        message: "Mill owners can only create BUY listings"
      });
    }

    // Enforce maxListingsPerUser from system settings for FARMERS
    if (req.user.role === "FARMER") {
      const settings = await SystemSetting.findOne();
      const maxAllowed = settings?.maxListingsPerUser || 20;
      const activeCount = await Listing.countDocuments({ owner: ownerId, status: "ACTIVE" });
      if (activeCount >= maxAllowed) {
        return res.status(400).json({
          message: `You have reached the maximum allowed active listings (${maxAllowed}). Please remove an existing listing first.`
        });
      }
    }

    const newListing = new Listing({
      owner: ownerId,
      listingType,
      paddyType,
      quantityKg,
      pricePerKg,
      location: {
        district,
        address
      },
      description
    });

    const savedListing = await newListing.save();

    res.status(201).json({
      message: "Listing created successfully",
      listing: savedListing
    });

  } catch (error) {
    next(error);
  }
};



// GET MY LISTINGS
const getMyListings = async (req, res, next) => {
  try {

    const ownerId = req.user.id;

    const listings = await Listing.find({ owner: ownerId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: listings.length,
      listings
    });

  } catch (error) {
    next(error);
  }
};



// GET MARKETPLACE LISTINGS
// Mill owners browse farmer SELL listings
const getAllListings = async (req, res, next) => {
  try {

    const listings = await Listing.find({
      listingType: "SELL",
      status: "ACTIVE"
    })
      .populate("owner", "fullName email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: listings.length,
      listings
    });

  } catch (error) {
    next(error);
  }
};



// GET BUY LISTINGS
// Farmers browse mill owner BUY listings
const getBuyListings = async (req, res, next) => {

  try {

    const listings = await Listing.find({
      listingType: "BUY",
      status: "ACTIVE"
    })
      .populate("owner", "fullName email profileImage businessDetails")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: listings.length,
      listings
    });

  } catch (error) {
    next(error);
  }

};



// GET SINGLE LISTING
const getListingById = async (req, res, next) => {

  try {

    const listing = await Listing.findById(req.params.id)
      .populate("owner", "fullName email profileImage");

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found"
      });
    }

    res.status(200).json({
      listing
    });

  } catch (error) {
    next(error);
  }

};



// UPDATE LISTING
const updateListing = async (req, res, next) => {

  try {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found"
      });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to update this listing"
      });
    }

    listing.paddyType = req.body.paddyType || listing.paddyType;
    listing.quantityKg = req.body.quantityKg || listing.quantityKg;
    listing.pricePerKg = req.body.pricePerKg || listing.pricePerKg;
    listing.description = req.body.description || listing.description;

    if (!listing.location) {
      listing.location = {};
    }

    listing.location.district =
      req.body.district || listing.location.district;

    listing.location.address =
      req.body.address || listing.location.address;

    const updatedListing = await listing.save();

    res.status(200).json({
      message: "Listing updated successfully",
      listing: updatedListing
    });

  } catch (error) {
    next(error);
  }

};



// DELETE LISTING
const deleteListing = async (req, res, next) => {

  try {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found"
      });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this listing"
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      message: "Listing deleted successfully"
    });

  } catch (error) {
    next(error);
  }

};



module.exports = {
  createListing,
  getMyListings,
  getAllListings,
  getBuyListings,
  getListingById,
  updateListing,
  deleteListing
};