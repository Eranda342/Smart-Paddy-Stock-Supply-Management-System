const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes (require login)
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded; // attach user info (id + role)

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
};

// Role-based authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions",
      });
    }
    next();
  };
};

// Check if user is approved
const checkApproved = async (req, res, next) => {
  try {
    if (req.user.role === "ADMIN") return next();

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let status = "PENDING";
    if (user.role === "FARMER") status = user.farmDetails?.verificationStatus || "PENDING";
    else if (user.role === "MILL_OWNER") status = user.businessDetails?.verificationStatus || "PENDING";

    if (status === "PENDING") {
      return res.status(403).json({ message: "Pending approval" });
    }
    if (status === "REJECTED") {
      return res.status(403).json({ message: "Account rejected" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Account is not verified" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error checking approval" });
  }
};

module.exports = { protect, authorizeRoles, checkApproved };
