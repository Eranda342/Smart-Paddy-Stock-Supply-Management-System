const Listing = require("../models/Listing");
const Transaction = require("../models/Transaction");

const getFarmerDashboard = async (req, res) => {
  try {
    const farmerId = req.user._id || req.user.id;
    const listings = await Listing.find({ farmer: farmerId });

    const range = req.query.range || "all";
    const { startDate, endDate } = req.query;
    const isCustomRange = startDate && endDate;

    const allTransactions = await Transaction.find({
      farmer: farmerId
    }).populate("listing", "paddyType location address");

    const now = Date.now();
    let currentStart = 0;
    let previousStart = 0;

    if (!isCustomRange) {
      if (range === "7d") {
        currentStart = now - 7 * 24 * 60 * 60 * 1000;
        previousStart = now - 14 * 24 * 60 * 60 * 1000;
      } else if (range === "30d") {
        currentStart = now - 30 * 24 * 60 * 60 * 1000;
        previousStart = now - 60 * 24 * 60 * 60 * 1000;
      }
    }

    let transactions;
    if (isCustomRange) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      transactions = allTransactions.filter(t => {
        const ts = new Date(t.createdAt).getTime();
        return ts >= start && ts <= end.getTime();
      });
    } else {
      transactions = range === "all"
        ? allTransactions
        : allTransactions.filter(t => new Date(t.createdAt).getTime() >= currentStart);
    }

    //-------------------------------------
    // STATS
    //-------------------------------------

    const activeListings = listings.filter(l => l.status === "ACTIVE").length || listings.length;

    const completedTransactions = transactions.filter(
      t => t.status === "COMPLETED"
    );

    const ongoingTransactions = transactions.filter(
      t => t.status !== "COMPLETED"
    );

    const monthlyRevenue = completedTransactions.reduce(
      (sum, t) => sum + (t.totalAmount || 0),
      0
    );

    // Calculate Growth (only for predefined ranges, not custom)
    let growth = 0;
    if (!isCustomRange && range !== "all") {
      const current = allTransactions.filter(
        t => t.status === "COMPLETED" && new Date(t.createdAt).getTime() >= currentStart
      );
      const previous = allTransactions.filter(
        t => t.status === "COMPLETED" && 
        new Date(t.createdAt).getTime() >= previousStart && 
        new Date(t.createdAt).getTime() < currentStart
      );

      const currentRevenue = current.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      const previousRevenue = previous.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

      if (previousRevenue > 0) {
        growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      } else if (currentRevenue > 0) {
        growth = 100;
      }
    }

    //-------------------------------------
    // RECENT ACTIVITY (last 5)
    //-------------------------------------

    const recent = [...transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    //-------------------------------------
    // PADDY DISTRIBUTION
    //-------------------------------------

    const distribution = {};

    transactions.forEach(t => {
      const type = t.listing?.paddyType || "Other";
      distribution[type] = (distribution[type] || 0) + (t.quantityKg || 0);
    });

    const bestType = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0];
    const bestSelling = bestType ? bestType[0] : null;

    //-------------------------------------
    // LOCATION INSIGHTS
    //-------------------------------------
    
    const locations = {};
    transactions.forEach(t => {
      const loc = t.listing?.location?.district || t.listing?.location || "Sri Lanka";
      locations[loc] = (locations[loc] || 0) + (t.totalAmount || 0);
    });

    //-------------------------------------
    // SALES TREND (by month)
    //-------------------------------------

    const monthly = {};

    completedTransactions.forEach(t => {
      const month = new Date(t.createdAt).toLocaleString("default", {
        month: "short"
      });

      monthly[month] = (monthly[month] || 0) + (t.totalAmount || 0);
    });

    //-------------------------------------

    res.json({
      stats: {
        activeListings,
        ongoingTransactions: ongoingTransactions.length,
        completedTransactions: completedTransactions.length,
        monthlyRevenue,
        growth
      },
      recent,
      distribution,
      monthly,
      bestSelling,
      locations
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMillOwnerDashboard = async (req, res) => {
  try {
    const millOwnerId = req.user._id || req.user.id;
    
    const allTransactions = await Transaction.find({
      millOwner: millOwnerId
    }).populate("listing", "paddyType location address").populate("farmer", "fullName");

    const Negotiation = require("../models/Negotiation");
    const negotiations = await Negotiation.find({
      millOwner: millOwnerId,
      status: { $in: ["PENDING", "ACTIVE", "COUNTER_OFFER"] }
    });

    const range = req.query.range || "all";
    const { startDate, endDate } = req.query;
    const isCustomRange = startDate && endDate;
    const now = Date.now();
    let currentStart = 0;
    let previousStart = 0;

    if (!isCustomRange) {
      if (range === "7d") {
        currentStart = now - 7 * 24 * 60 * 60 * 1000;
        previousStart = now - 14 * 24 * 60 * 60 * 1000;
      } else if (range === "30d") {
        currentStart = now - 30 * 24 * 60 * 60 * 1000;
        previousStart = now - 60 * 24 * 60 * 60 * 1000;
      }
    }

    let transactions;
    if (isCustomRange) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      transactions = allTransactions.filter(t => {
        const ts = new Date(t.createdAt).getTime();
        return ts >= start && ts <= end.getTime();
      });
    } else {
      transactions = range === "all"
        ? allTransactions
        : allTransactions.filter(t => new Date(t.createdAt).getTime() >= currentStart);
    }

    const activePurchases = transactions.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED").length;
    const ongoingNegotiations = negotiations.length;

    const completedTransactions = transactions.filter(
      t => t.status === "COMPLETED" || t.status === "DELIVERED"
    );

    const monthlyProcurementKg = completedTransactions.reduce(
      (sum, t) => sum + (t.quantityKg || 0),
      0
    );

    const totalSpend = completedTransactions.reduce(
      (sum, t) => sum + (t.totalAmount || 0),
      0
    );

    let growth = 0;
    if (!isCustomRange && range !== "all") {
      const current = allTransactions.filter(
        t => (t.status === "COMPLETED" || t.status === "DELIVERED") && new Date(t.createdAt).getTime() >= currentStart
      );
      const previous = allTransactions.filter(
        t => (t.status === "COMPLETED" || t.status === "DELIVERED") && 
        new Date(t.createdAt).getTime() >= previousStart && 
        new Date(t.createdAt).getTime() < currentStart
      );

      const currentSpend = current.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      const previousSpend = previous.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

      if (previousSpend > 0) {
        growth = ((currentSpend - previousSpend) / previousSpend) * 100;
      } else if (currentSpend > 0) {
        growth = 100;
      }
    }

    const recent = [...transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const distribution = {};
    completedTransactions.forEach(t => {
      const type = t.listing?.paddyType || "Other";
      distribution[type] = (distribution[type] || 0) + (t.quantityKg || 0);
    });

    const bestType = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0];
    const bestSelling = bestType ? bestType[0] : null;
    
    const locations = {};
    transactions.forEach(t => {
      const loc = t.listing?.location?.district || t.listing?.location || "Sri Lanka";
      locations[loc] = (locations[loc] || 0) + 1;
    });

    const monthly = {};
    completedTransactions.forEach(t => {
      const month = new Date(t.createdAt).toLocaleString("default", {
        month: "short"
      });
      monthly[month] = (monthly[month] || 0) + (t.totalAmount || 0);
    });

    res.json({
      stats: {
        activePurchases,
        ongoingNegotiations,
        monthlyProcurementKg,
        totalSpend,
        growth
      },
      recent,
      distribution,
      monthly,
      bestSelling,
      locations
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFarmerDashboard,
  getMillOwnerDashboard
};
