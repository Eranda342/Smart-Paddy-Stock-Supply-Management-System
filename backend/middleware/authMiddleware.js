const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. verifyToken - checks JWT
const verifyToken = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
};

// 2. requireAdmin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

// 3. requireVerifiedUser
const requireVerifiedUser = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "ADMIN") {
      return next();
    }
    const user = await User.findById(req.user.id);
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

// Legacy alias to prevent breaking other routes
const protect = verifyToken;
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};
const checkApproved = requireVerifiedUser;

module.exports = { 
  verifyToken, requireAdmin, requireVerifiedUser,
  protect, authorizeRoles, checkApproved
};
