const Transaction = require("../models/Transaction");

const getMonthlySales = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          status: "COMPLETED", // only paid/completed transactions
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" }, // using schema correct field: totalAmount
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Format DB response
    const dbData = data.map((item) => {
      // Month is 1-indexed in mongodb ($month), so -1 for javascript Date
      const d = new Date(item._id.year, item._id.month - 1, 15);
      return {
        month: d.toLocaleString("default", { month: "short" }), // e.g., "Jan"
        sales: item.totalSales,
        year: item._id.year,
      };
    });

    // Generate exact chronological trailing 6 months, avoiding duplicates.
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      // Use the 15th to strictly avoid timezone month-boundary overlaps
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const monthLabel = d.toLocaleString("default", { month: "short" });
      const yearVal = d.getFullYear();
      
      const found = dbData.find(x => x.month === monthLabel && x.year === yearVal);
      
      last6Months.push({
        month: monthLabel,
        sales: found ? found.sales : 0,
      });
    }

    res.json(last6Months);
  } catch (error) {
    console.error("GET /api/analytics/monthly-sales ERROR:", error);
    res.status(500).json({ message: "Internal server error syncing charts" });
  }
};

module.exports = {
  getMonthlySales,
};
