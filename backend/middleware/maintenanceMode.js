const SystemSetting = require("../models/SystemSetting");

const maintenanceMode = async (req, res, next) => {
  try {
    // Skip for admin routes and auth routes completely
    if (
      req.path.startsWith("/api/admin") ||
      req.path.startsWith("/api/auth") ||
      req.path.startsWith("/uploads")
    ) {
      return next();
    }

    const settings = await SystemSetting.findOne();
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // Decode token to check if admin
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === "ADMIN") return next();
      } catch {
        // invalid token — fall through to block
      }
    }

    return res.status(503).json({
      message: "🔧 Platform is currently under maintenance. Please try again later.",
      maintenanceMode: true
    });

  } catch (err) {
    // Don't crash in case of DB error — allow through
    next();
  }
};

module.exports = maintenanceMode;
