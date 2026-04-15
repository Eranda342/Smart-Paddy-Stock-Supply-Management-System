const User = require("../models/User");
const Listing = require("../models/Listing");
const { getApprovalEmailTemplate, getRejectionEmailTemplate } = require("../utils/authUtils");
const sendEmail = require("../utils/sendEmail");
const Negotiation = require("../models/Negotiation");
const Transaction = require("../models/Transaction");
const Dispute = require("../models/Dispute");
const bcrypt = require("bcryptjs");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const SystemSetting = require("../models/SystemSetting");

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
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new User({
      fullName,
      email,
      password: hashedPassword,
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
    if (req.params.id === String(req.user._id)) {
      return res.status(403).json({ message: "You cannot delete your own account" });
    }
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
    if (req.params.id === String(req.user._id)) {
      return res.status(403).json({ message: "You cannot suspend your own account" });
    }
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

// Update a listing status (admin)
const adminUpdateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = status;
    await listing.save();

    res.status(200).json({ message: "Listing status updated", listing });
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

    // Derive the latest offer price and quantity from messages and attach as
    // top-level fields so the admin table can display them directly.
    const enriched = negotiations.map(neg => {
      const obj = neg.toObject();

      // Walk messages in reverse to find the most recent OFFER or COUNTER message
      const offerMessages = (obj.messages || [])
        .filter(m => m.type === "OFFER" || m.type === "COUNTER")
        .reverse();

      const latestOffer = offerMessages.find(m => m.offeredPrice);
      const latestQty   = offerMessages.find(m => m.quantityKg);

      obj.offeredPrice = latestOffer?.offeredPrice ?? null;
      obj.quantity     = latestQty?.quantityKg ?? null;

      return obj;
    });

    res.status(200).json({ count: enriched.length, negotiations: enriched });
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
    
    // Support date filtering if present in query
    const range = req.query.range || "all";
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    } else if (range === "7d") {
      filter.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (range === "30d") {
      filter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    let transactions = await Transaction.find(filter)
      .populate("farmer", "fullName email")
      .populate("millOwner", "fullName email")
      .populate("listing", "paddyType location")
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

// ================= DISPUTES MANAGEMENT =================

const emailTpl = (title, lines) => `
<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0b0f19;color:#e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#0f172a;padding:24px 32px;border-bottom:2px solid #22C55E;">
    <h2 style="margin:0;color:#22C55E;font-size:20px;">🌾 AgroBridge</h2>
  </div>
  <div style="padding:28px 32px;">
    <h3 style="margin:0 0 16px;color:#fff;font-size:18px;">${title}</h3>
    ${lines.map(l => `<p style="margin:6px 0;color:#9ca3af;font-size:14px;line-height:1.6;">${l}</p>`).join('')}
    <div style="margin-top:24px;padding:16px;background:#1e293b;border-radius:8px;border-left:3px solid #22C55E;">
      <p style="margin:0;color:#6b7280;font-size:12px;">Log in to AgroBridge to view the full case details.</p>
    </div>
  </div>
</div>`;

const notifyParties = async (dispute, subject, title, lines, io) => {
  try {
    const populated = await Dispute.findById(dispute._id)
      .populate('raisedBy', 'email fullName')
      .populate('againstUser', 'email fullName');
      
    const parties = [];
    if (populated?.raisedBy) parties.push(populated.raisedBy);
    if (populated?.againstUser) parties.push(populated.againstUser);

    for (const party of parties) {
      if (party.email) {
        await sendEmail({ to: party.email, subject, html: emailTpl(title, lines) });
      }
      
      const msgText = lines[0]?.replace(/<[^>]*>?/gm, '') || 'Dispute update';
      
      await Notification.create({
        user: party._id,
        message: `${title} - ${msgText}`,
        type: 'DISPUTE_UPDATE',
        transactionId: dispute.transaction || null
      }).catch(err => console.error('Notification save error:', err));

      if (io) {
        io.to(String(party._id)).emit('userNotification', {
          title,
          message: msgText,
          timestamp: new Date().toISOString()
        });
      }
    }
  } catch (e) {
    console.error('Admin dispute email error:', e.message);
  }
};

// Get all disputes (admin view) — fully populated
const getAllDisputes = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status && status !== 'ALL') filter.status = status;

    const disputes = await Dispute.find(filter)
      .populate('raisedBy',    'fullName role email')
      .populate('againstUser', 'fullName role email')
      .populate('resolvedBy',  'fullName email')
      .populate('messages.sender', 'fullName role')
      .populate({
        path:    'transaction',
        select:  '_id orderNumber status paymentStatus totalAmount quantityKg finalPricePerKg createdAt transportStatus',
        populate: [
          { path: 'farmer',    select: 'fullName email' },
          { path: 'millOwner', select: 'fullName email' },
          { path: 'listing',   select: 'paddyType location' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ count: disputes.length, disputes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark UNDER_REVIEW
const updateDisputeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status.` });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    const oldStatus   = dispute.status;
    dispute.status    = status;
    dispute.auditLog.push({
      action:          'STATUS_CHANGED',
      performedBy:     req.user._id,
      performedByRole: 'ADMIN',
      note:            `Status changed from ${oldStatus} to ${status}`,
    });
    await dispute.save();

    const io = req.app.get('io');
    if (io) io.emit('disputeUpdated', dispute);

    if (status === 'UNDER_REVIEW') {
      await notifyParties(dispute,
        `[AgroBridge] Dispute Is Now Under Review`,
        'Dispute Under Review',
        [
          `The case <strong>${dispute.title}</strong> is now being actively reviewed by our team.`,
          `We will contact you if additional information is required.`,
        ],
        io
      );
    }

    res.status(200).json({ message: 'Dispute updated', dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request More Information from reporter
const requestMoreInfo = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'A message is required.' });

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (['RESOLVED', 'REJECTED'].includes(dispute.status)) {
      return res.status(400).json({ message: 'This dispute is closed.' });
    }

    // Store as an in-dispute message
    dispute.messages.push({
      sender:     req.user._id,
      senderRole: 'ADMIN',
      message:    message.trim(),
    });

    dispute.auditLog.push({
      action:          'INFO_REQUESTED',
      performedBy:     req.user._id,
      performedByRole: 'ADMIN',
      note:            `Admin requested info: "${message.trim().slice(0, 80)}"`,
    });

    await dispute.save();

    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('disputeMessage', dispute.messages[dispute.messages.length - 1]);
      io.emit('disputeUpdated');
    }

    await notifyParties(dispute,
      `[AgroBridge] Additional Information Required — ${dispute.title}`,
      'Information Required',
      [
        `An administrator has reviewed your case and needs additional information.`,
        `<strong>Admin message:</strong> ${message.trim()}`,
        `Please log in and reply in the case chat to continue.`,
      ],
      io
    );

    res.status(200).json({ message: 'Request sent.', dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resolve a dispute
const resolveDispute = async (req, res) => {
  try {
    const { resolution, decisionType } = req.body;
    if (!resolution?.trim()) {
      return res.status(400).json({ message: 'A resolution message is required.' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (['RESOLVED', 'REJECTED'].includes(dispute.status)) {
      return res.status(400).json({ message: 'This dispute is already closed.' });
    }

    dispute.status       = 'RESOLVED';
    dispute.resolution   = resolution.trim();
    dispute.decisionType = decisionType || '';
    dispute.resolvedBy   = req.user._id;
    dispute.resolvedAt   = new Date();
    dispute.auditLog.push({
      action:          'DISPUTE_RESOLVED',
      performedBy:     req.user._id,
      performedByRole: 'ADMIN',
      note:            `Resolved — Decision: ${decisionType || 'N/A'} — ${resolution.trim()}`,
    });
    await dispute.save();

    const io = req.app.get('io');
    if (io) io.emit('disputeUpdated', dispute);

    await notifyParties(dispute,
      `[AgroBridge] Dispute Has Been Resolved`,
      'Dispute Resolved ✅',
      [
        `The case <strong>${dispute.title}</strong> has been reviewed and resolved.`,
        `<strong>Decision:</strong> ${decisionType ? decisionType.replace('_', ' ') : 'No specific action'}`,
        `<strong>Resolution:</strong> ${resolution.trim()}`,
        `If you have further concerns, please contact our support team.`,
      ],
      io
    );

    res.status(200).json({ message: 'Dispute resolved successfully', dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a dispute
const rejectDispute = async (req, res) => {
  try {
    const { resolution } = req.body;

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (['RESOLVED', 'REJECTED'].includes(dispute.status)) {
      return res.status(400).json({ message: 'This dispute is already closed.' });
    }

    dispute.status     = 'REJECTED';
    dispute.resolution = (resolution || 'Dispute rejected by administrator.').trim();
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    dispute.auditLog.push({
      action:          'DISPUTE_REJECTED',
      performedBy:     req.user._id,
      performedByRole: 'ADMIN',
      note:            `Rejected — ${dispute.resolution}`,
    });
    await dispute.save();

    const io = req.app.get('io');
    if (io) io.emit('disputeUpdated', dispute);

    await notifyParties(dispute,
      `[AgroBridge] Dispute Outcome — ${dispute.title}`,
      'Dispute Closed',
      [
        `The case <strong>${dispute.title}</strong> has been reviewed.`,
        `<strong>Outcome:</strong> Dispute rejected.`,
        `<strong>Reason:</strong> ${dispute.resolution}`,
        `If you believe this decision is incorrect, please contact support.`,
      ],
      io
    );

    res.status(200).json({ message: 'Dispute rejected', dispute });
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
    const [totalUsers, pendingApprovals, activeListings, totalTransactions, totalNegotiations, pendingKYC] = await Promise.all([
      User.countDocuments({ role: { $ne: "ADMIN" } }),
      User.countDocuments({
        role: { $ne: "ADMIN" },
        $or: [
          { role: "FARMER", "farmDetails.verificationStatus": "PENDING" },
          { role: "MILL_OWNER", "businessDetails.verificationStatus": "PENDING" }
        ]
      }),
      Listing.countDocuments({ status: { $in: ["ACTIVE", "NEGOTIATING"] } }),
      Transaction.countDocuments(),
      Negotiation.countDocuments(),
      User.countDocuments({
        role: { $ne: "ADMIN" },
        $or: [
          { role: "FARMER", "farmDetails.verificationStatus": "PENDING" },
          { role: "MILL_OWNER", "businessDetails.verificationStatus": "PENDING" }
        ]
      })
    ]);

    // ── Platform Revenue ─────────────────────────────────────────
    const revenueResult = await Transaction.aggregate([
      { $match: { status: "COMPLETED" } }, // adjust if your status differs
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" } // using totalAmount as per Transaction schema
        }
      }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

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

    // ── Monthly Revenue (revenue summed per month) ──────
    const revenueAgg = await Transaction.aggregate([
      { $match: { status: "COMPLETED", createdAt: { $gte: windowStart } } },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1; // 1-based
      const hit = revenueAgg.find(a => a._id.year === yr && a._id.month === mo);
      monthlyRevenue.push({
        month: MONTH_NAMES[mo - 1],
        revenue: hit ? hit.revenue : 0
      });
    }

    const currentMonthRev = monthlyRevenue[5].revenue;
    const lastMonthRev = monthlyRevenue[4].revenue;
    let revenueGrowth = 0;
    if (lastMonthRev > 0) {
      revenueGrowth = ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100;
    } else if (currentMonthRev > 0) {
      revenueGrowth = 100; 
    }

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
      totalRevenue,
      totalNegotiations,
      pendingKYC,
      monthlyTrading,
      monthlyRevenue,
      revenueGrowth,
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

    // Send approval email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const loginUrl = `${frontendUrl}/login`; 

    try {
      await sendEmail({
        to: user.email,
        subject: "AgroBridge - Account Approved",
        html: getApprovalEmailTemplate(loginUrl)
      });
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

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

    // Send rejection email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resubmitUrl = `${frontendUrl}/login`; 

    try {
      await sendEmail({
        to: user.email,
        subject: "AgroBridge - Action Required on Your Application",
        html: getRejectionEmailTemplate(reason, resubmitUrl)
      });
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    res.status(200).json({ message: "User rejected", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ANALYTICS =================

const getDateFilter = (req) => {
  const range = req.query.range || "all";
  const { startDate, endDate } = req.query;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { $gte: start, $lte: end };
  } else if (range === "7d") {
    return { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (range === "30d") {
    return { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  return null;
};

const getAnalyticsOverview = async (req, res) => {
  try {
    const dateFilter = getDateFilter(req);
    const filter = dateFilter ? { createdAt: dateFilter } : {};
    
    const userFilter = { role: { $ne: "ADMIN" } };
    if (dateFilter) userFilter.createdAt = dateFilter;

    const totalUsers = await User.countDocuments(userFilter);
    const totalTransactions = await Transaction.countDocuments(filter);
    const totalListings = await Listing.countDocuments(filter);
    
    const revMatch = { paymentStatus: "PAID" };
    if (dateFilter) revMatch.createdAt = dateFilter;

    const revResult = await Transaction.aggregate([
      { $match: revMatch },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revResult[0]?.totalRevenue || 0;
    
    const deliveryFilter = { transportStatus: "DELIVERED" };
    if (dateFilter) deliveryFilter.createdAt = dateFilter;
    const completedDeliveries = await Transaction.countDocuments(deliveryFilter);

    res.status(200).json({ totalUsers, totalTransactions, totalRevenue, totalListings, completedDeliveries });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAnalyticsRevenue = async (req, res) => {
  try {
    const now = new Date();
    const dateFilter = getDateFilter(req);
    
    // Always align revenue with paymentStatus="PAID" for consistency with Overview
    const matchCriteria = { paymentStatus: "PAID" };
    
    let isDaily = false;
    let daysDiff = 180; // default 6 months
    let startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    let endDate = now;

    if (dateFilter) {
      matchCriteria.createdAt = dateFilter;
      startDate = dateFilter.$gte;
      // If there's an end date use it, otherwise use 'now'
      endDate = dateFilter.$lte || now;
      
      const diffTime = Math.abs(endDate - startDate);
      daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Use daily granularity if range <= 60 days
      if (daysDiff <= 60) {
        isDaily = true;
      }
    } else {
      matchCriteria.createdAt = { $gte: startDate };
    }
    
    const revenueAgg = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    let monthlyRevenue = [];
    
    if (isDaily) {
      // Fill missing days
      for (let i = daysDiff - 1; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        const yr = d.getFullYear();
        const mo = d.getMonth() + 1;
        const day = d.getDate();
        
        const hit = revenueAgg.find(a => a._id.year === yr && a._id.month === mo && a._id.day === day);
        monthlyRevenue.push({
          month: `${MONTH_NAMES[mo - 1]} ${day}`,
          revenue: hit ? hit.revenue : 0
        });
      }
    } else {
      // Fill missing months (up to 12 max or dynamically based on range)
      // Since default is 6 months, we'll keep 6 months if range='all'
      // If custom > 60 days, we'll calculate month difference
      let monthsToGenerate = 6;
      if (dateFilter) {
        monthsToGenerate = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
      }
      
      for (let i = monthsToGenerate - 1; i >= 0; i--) {
        const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const yr = d.getFullYear();
        const mo = d.getMonth() + 1;
        
        const hit = revenueAgg.filter(a => a._id.year === yr && a._id.month === mo)
                              .reduce((s, a) => s + a.revenue, 0);
        monthlyRevenue.push({
          month: `${MONTH_NAMES[mo - 1]} ${yr.toString().slice(-2)}`,
          revenue: hit || 0
        });
      }
    }
    
    // Debug logging for prompt validation
    console.log(`[getAnalyticsRevenue] Filter applied: isDaily=${isDaily}, dataPoints=${monthlyRevenue.length}, totalRevenueCount=${revenueAgg.length}`);
    
    res.status(200).json(monthlyRevenue);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: error.message }); 
  }
};

const getAnalyticsUsers = async (req, res) => {
  try {
    const dateFilter = getDateFilter(req);
    const match = { role: { $ne: "ADMIN" } };
    if (dateFilter) match.createdAt = dateFilter;

    const data = await User.aggregate([
      { $match: match },
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    const formatted = data.map(d => ({ name: d._id, value: d.count }));
    res.status(200).json(formatted);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAnalyticsPaddy = async (req, res) => {
  try {
    const dateFilter = getDateFilter(req);
    const match = {};
    if (dateFilter) match.createdAt = dateFilter;

    const data = await Listing.aggregate([
      { $match: match },
      { $group: { _id: "$paddyType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const formatted = data.map(d => ({ name: d._id || "Unknown", value: d.count }));
    res.status(200).json(formatted);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAnalyticsDistricts = async (req, res) => {
  try {
    const dateFilter = getDateFilter(req);
    const match = {};
    if (dateFilter) match.createdAt = dateFilter;

    const data = await Listing.aggregate([
      { $match: match },
      { $group: { _id: "$location.district", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const formatted = data.map(d => ({ name: d._id || "Unknown", value: d.count }));
    res.status(200).json(formatted);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAnalyticsConversion = async (req, res) => {
  try {
    const dateFilter = getDateFilter(req);
    const negFilter = { status: { $in: ["ACCEPTED", "AGREED"] } };
    const txnFilter = {};
    
    if (dateFilter) {
      negFilter.updatedAt = dateFilter;
      txnFilter.createdAt = dateFilter;
    }

    const accepted = await Negotiation.countDocuments(negFilter);
    const transactions = await Transaction.countDocuments(txnFilter);
    let rate = 0;
    if (accepted > 0) {
      rate = (transactions / accepted) * 100;
    }
    if (rate > 100) rate = 100;

    res.status(200).json({ 
      rate: rate.toFixed(1),
      acceptedNegotiations: accepted,
      transactions: transactions
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// ================= SYSTEM SETTINGS =================
const getPlatformSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting({});
      await settings.save();
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePlatformSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) settings = new SystemSetting({});

    const fields = ["platformFeePercentage", "autoDisputeDays", "maintenanceMode", "maxListingsPerUser", "supportEmail"];
    fields.forEach(f => {
      if (req.body[f] !== undefined) settings[f] = req.body[f];
    });

    await settings.save();
    res.status(200).json({ message: "Settings updated", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= NOTIFICATIONS CENTER =================
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, body, target } = req.body;
    if (!title || !body || !target) return res.status(400).json({ message: "Missing fields" });

    // Find users
    let query = { role: { $ne: "ADMIN" } };
    if (target === "FARMER") query.role = "FARMER";
    if (target === "MILL_OWNER") query.role = "MILL_OWNER";
    
    // Select only IDs
    const users = await User.find(query).select("_id");
    
    // Save Announcement record for Admin History
    const announcement = new Announcement({
       title, body, target, count: users.length, status: "SENT"
    });
    await announcement.save();

    // Broadcast individual generic notifications for User Bell Dropdown mapping
    const titleHeader = "ADMIN: " + title + "\\n" + body;
    const notifications = users.map(u => ({
       user: u._id,
       message: titleHeader,
       type: "SYSTEM_ALERT"
    }));
    await Notification.insertMany(notifications);

    // Socket ping
    const io = req.app.get("io");
    if (io) {
      io.emit("newNotification"); // For admin dashboard sync
      users.forEach(u => {
        io.to(u._id.toString()).emit("newNotification", { title: "ADMIN: " + title, body: body });
      });
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
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
  createAdmin,
  adminUpdateListingStatus,
  getAnalyticsOverview,
  getAnalyticsRevenue,
  getAnalyticsUsers,
  getAnalyticsPaddy,
  getAnalyticsDistricts,
  getAnalyticsConversion,
  getAllDisputes,
  updateDisputeStatus,
  resolveDispute,
  rejectDispute,
  requestMoreInfo,
  getPlatformSettings,
  updatePlatformSettings,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
