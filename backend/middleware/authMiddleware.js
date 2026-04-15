const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. protect - verifies JWT AND checks isBlocked in DB
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Always fetch fresh user to catch isBlocked / deletion since token was issued
      const user = await User.findById(decoded.id || decoded._id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Account not found. Please log in again." });
      }
      if (user.isBlocked) {
        return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
      }

      req.user = user; // attach full user object (not just decoded JWT payload)
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
};

// Legacy alias — verifyToken kept as protect for backward compatibility
const verifyToken = protect;


// 2. requireAdmin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

// 3. requireVerifiedUser / checkApproved
// Note: req.user is already the full Mongoose user doc (set by protect above).
// We use req.user directly instead of re-fetching from DB.
const requireVerifiedUser = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "ADMIN") {
      return next();
    }
    // req.user is already the live DB user (fetched in protect)
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    let status = "PENDING";
    if (user.role === "FARMER") status = user.farmDetails?.verificationStatus;
    else if (user.role === "MILL_OWNER") status = user.businessDetails?.verificationStatus;

    if (status !== "APPROVED") {
      return res.status(403).json({ message: "Account not approved" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error checking approval" });
  }
};

const checkApproved = requireVerifiedUser;

// 4. authorizeRoles — restricts route to specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = { 
  verifyToken, requireAdmin, requireVerifiedUser,
  protect, authorizeRoles, checkApproved
};
