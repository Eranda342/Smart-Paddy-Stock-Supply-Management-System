const User = require("../models/User");
const Listing = require("../models/Listing");
const Negotiation = require("../models/Negotiation");
const Transaction = require("../models/Transaction");

// ================= USER MANAGEMENT =================

// Get all unverified users
const getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: false }).select("-password");
    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify user
const verifyUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: "User verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    if (role && role !== "ALL") filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LISTINGS MANAGEMENT =================

// Get all listings (admin view)
const getAllListings = async (req, res) => {
  try {
    const { district, status, search } = req.query;
    let filter = {};

    // Listing.status is ACTIVE / NEGOTIATING / CLOSED
    if (status) filter.status = status;

    // Location district is nested
    if (district) filter["location.district"] = { $regex: district, $options: "i" };

    if (search) {
      filter.$or = [
        { paddyType: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const listings = await Listing.find(filter)
      .populate("owner", "fullName email farmDetails")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a listing (admin)
const adminDeleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.status(200).json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= NEGOTIATIONS MONITORING =================

// Get all negotiations (admin view)
const getAllNegotiations = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status) filter.status = status;

    let negotiations = await Negotiation.find(filter)
      .populate("farmer", "fullName email")
      .populate("millOwner", "fullName email")
      .populate("listing", "paddyType pricePerKg quantityKg")
      .sort({ updatedAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      negotiations = negotiations.filter(n =>
        n.farmer?.fullName?.toLowerCase().includes(s) ||
        n.millOwner?.fullName?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({ count: negotiations.length, negotiations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= TRANSACTIONS MANAGEMENT =================

// Get all transactions (admin view)
const getAllTransactions = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status) filter.paymentStatus = status;  // filter by paymentStatus

    let transactions = await Transaction.find(filter)
      .populate("farmer", "fullName email")
      .populate("millOwner", "fullName email")
      .populate("listing", "paddyType")
      .populate("vehicle")
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      transactions = transactions.filter(t =>
        t.farmer?.fullName?.toLowerCase().includes(s) ||
        t.millOwner?.fullName?.toLowerCase().includes(s)
      );
    }

    const paid = transactions.filter(t => t.paymentStatus === "PAID");
    const totalRevenue = paid.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

    res.status(200).json({
      count: transactions.length,
      transactions,
      stats: {
        total: transactions.length,
        paid: paid.length,
        pending: transactions.filter(t => t.paymentStatus === "PENDING").length,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= TRANSPORT MANAGEMENT =================

// Get all transport data (admin view) — transactions with transport required
const getAllTransport = async (req, res) => {
  try {
    const { transportStatus, search } = req.query;

    // Filter transactions where farmer decided transport is required
    let filter = { transportRequired: true };
    if (transportStatus) filter.transportStatus = transportStatus;

    let transactions = await Transaction.find(filter)
      .populate("farmer", "fullName email")
      .populate("millOwner", "fullName email")
      .populate("listing", "paddyType")
      .populate("vehicle")
      .sort({ updatedAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      transactions = transactions.filter(t =>
        t.farmer?.fullName?.toLowerCase().includes(s) ||
        t.millOwner?.fullName?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({ count: transactions.length, transports: transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= PLATFORM STATS =================

// Platform overview stats
const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalListings, totalNegotiations, totalTransactions, pendingVerifications] = await Promise.all([
      User.countDocuments({ role: { $ne: "ADMIN" } }),
      Listing.countDocuments(),
      Negotiation.countDocuments(),
      Transaction.countDocuments(),
      User.countDocuments({ isVerified: false })
    ]);

    const paidTransactions = await Transaction.find({ paymentStatus: "PAID" });
    const totalRevenue = paidTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

    res.status(200).json({
      totalUsers,
      totalListings,
      totalNegotiations,
      totalTransactions,
      pendingVerifications,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUnverifiedUsers,
  verifyUser,
  getAllUsers,
  deleteUser,
  getAllListings,
  adminDeleteListing,
  getAllNegotiations,
  getAllTransactions,
  getAllTransport,
  getPlatformStats
};
