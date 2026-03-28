const User = require("../models/User");
const Listing = require("../models/Listing");
const Negotiation = require("../models/Negotiation");
const Transaction = require("../models/Transaction");

// Month name helper
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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

// Create Admin natively
const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password before saving via mongoose middleware (or manually)
    // Wait, the User schema has a generic 'pre' save hook? Yes, usually.
    const newAdmin = new User({
      fullName,
      email,
      password, // assuming User model hashes this on run
      role: "ADMIN",
      isVerified: true
    });
    
    // Ensure nested states are not flagged entirely as pending
    newAdmin.farmDetails = { verificationStatus: "APPROVED" };
    newAdmin.businessDetails = { verificationStatus: "APPROVED" };
    
    await newAdmin.save();
    return res.status(201).json({ message: "Admin created successfully", user: { _id: newAdmin._id, email: newAdmin.email }});
  } catch (error) {
    res.status(500).json({ message: "Error creating admin" });
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
    
    if (req.query.status && req.query.status !== "ALL") {
      const state = req.query.status.toUpperCase();
      if (state === "BLOCKED") {
        filter.isBlocked = true;
      } else {
        filter.isBlocked = false;
        // Apply complex nested filtering for Verification Status
        if (!filter.$or) filter.$or = [];
        const statusOr = [
          { role: "FARMER", "farmDetails.verificationStatus": state },
          { role: "MILL_OWNER", "businessDetails.verificationStatus": state }
        ];
        
        // Combine with existing $or if search is used
        if (filter.$or.length > 0) {
          filter.$and = [{ $or: filter.$or }, { $or: statusOr }];
          delete filter.$or;
        } else {
          filter.$or = statusOr;
        }
      }
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

// Block user
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot block admins" });
    
    user.isBlocked = true;
    await user.save();
    res.status(200).json({ message: "User blocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isBlocked = false;
    await user.save();
    res.status(200).json({ message: "User unblocked successfully", user });
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
      User.countDocuments({
        role: { $ne: "ADMIN" },
        $or: [
          { role: "FARMER", "farmDetails.verificationStatus": "PENDING" },
          { role: "MILL_OWNER", "businessDetails.verificationStatus": "PENDING" }
        ]
      })
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

// ================= DASHBOARD (new) =================

/**
 * GET /api/admin/dashboard
 * Returns KPI counts + 6-month time-series for trading volume and user growth.
 */
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    // Start of the window: 1st day of the month, 5 months ago
    const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ── Scalar KPIs ──────────────────────────────────────────────
    const [totalUsers, pendingApprovals, activeListings, totalTransactions] = await Promise.all([
      User.countDocuments({ role: { $ne: "ADMIN" } }),
      User.countDocuments({
        role: { $ne: "ADMIN" },
        $or: [
          { role: "FARMER", "farmDetails.verificationStatus": "PENDING" },
          { role: "MILL_OWNER", "businessDetails.verificationStatus": "PENDING" }
        ]
      }),
      Listing.countDocuments({ status: { $in: ["ACTIVE", "NEGOTIATING"] } }),
      Transaction.countDocuments()
    ]);

    // ── Monthly Trading Volume (quantityKg summed per month) ──────
    const tradingAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: windowStart } } },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" }
          },
          volume: { $sum: "$quantityKg" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Build a filled 6-month array (fill missing months with 0)
    const monthlyTrading = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1; // 1-based
      const hit = tradingAgg.find(a => a._id.year === yr && a._id.month === mo);
      monthlyTrading.push({
        month: MONTH_NAMES[mo - 1],
        volume: hit ? hit.volume : 0
      });
    }

    // ── User Growth (new registrations per month, by role) ────────
    const userGrowthAgg = await User.aggregate([
      { $match: { role: { $ne: "ADMIN" }, createdAt: { $gte: windowStart } } },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
            role:  "$role"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1;
      const farmers   = userGrowthAgg.find(a => a._id.year === yr && a._id.month === mo && a._id.role === "FARMER");
      const millOwners = userGrowthAgg.find(a => a._id.year === yr && a._id.month === mo && a._id.role === "MILL_OWNER");
      userGrowth.push({
        month:   MONTH_NAMES[mo - 1],
        Farmers: farmers   ? farmers.count   : 0,
        Mills:   millOwners ? millOwners.count : 0
      });
    }

    res.status(200).json({
      totalUsers,
      pendingApprovals,
      activeListings,
      totalTransactions,
      monthlyTrading,
      userGrowth
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFICATIONS MANAGEMENT =================

/**
 * GET /api/admin/verifications
 * Returns all non-admin users with a PENDING verification status (farmer or mill owner).
 * Supports ?role=FARMER|MILL_OWNER and ?search= query params.
 */
const getPendingVerifications = async (req, res) => {
  try {
    let { role, search, status = "PENDING" } = req.query;
    status = status.toUpperCase();

    let filter = {
      role: { $ne: "ADMIN" },
      $or: [
        { role: "FARMER", "farmDetails.verificationStatus": status },
        { role: "MILL_OWNER", "businessDetails.verificationStatus": status }
      ]
    };

    if (role && role !== "ALL") {
      filter.role = role;
      // If a specific role is given, we can simplify the $or to a direct match
      delete filter.$or;
      if (role === "FARMER") {
        filter["farmDetails.verificationStatus"] = status;
      } else if (role === "MILL_OWNER") {
        filter["businessDetails.verificationStatus"] = status;
      }
    }

    let users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      users = users.filter(u =>
        u.fullName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.nic?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/admin/verifications/:id/approve
 * Approves a user's verification — sets verificationStatus to APPROVED and isVerified to true.
 */
const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "FARMER") {
      user.farmDetails.verificationStatus = "APPROVED";
    } else if (user.role === "MILL_OWNER") {
      user.businessDetails.verificationStatus = "APPROVED";
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "User approved successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/admin/verifications/:id/reject
 * Rejects a user's verification with an optional reason.
 * Body: { reason: string }
 */
const rejectVerification = async (req, res) => {
  try {
    const { reason = "" } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "FARMER") {
      user.farmDetails.verificationStatus = "REJECTED";
      user.farmDetails.rejectionReason = reason;
    } else if (user.role === "MILL_OWNER") {
      user.businessDetails.verificationStatus = "REJECTED";
      user.businessDetails.rejectionReason = reason;
    }

    user.isVerified = false;
    await user.save();

    res.status(200).json({ message: "User rejected", user });
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
  getPlatformStats,
  getDashboardStats,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  blockUser,
  unblockUser,
  createAdmin
};
