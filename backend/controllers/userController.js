const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= REGISTER USER =================
const registerUser = async (req, res) => {
  try {

    const {
      fullName,
      email,
      phone,
      nic,
      password,
      role,

      // Farmer fields
      operatingDistrict,
      landSize,
      paddyTypesCultivated,
      estimatedMonthlyStock,

      // Mill owner fields
      businessName,
      businessRegistrationNumber,
      millLocation
    } = req.body;

    const normalizedRole = role?.toUpperCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let userData = {
      fullName,
      email,
      phone,
      nic,
      password: hashedPassword,
      role: normalizedRole,
      isVerified: false
    };

    // ================= FARMER =================
    if (normalizedRole === "FARMER") {

      let parsedPaddyTypes = [];

      if (paddyTypesCultivated) {
        try {
          parsedPaddyTypes = JSON.parse(paddyTypesCultivated);
        } catch {
          parsedPaddyTypes = [paddyTypesCultivated];
        }
      }

      userData.farmDetails = {
        operatingDistrict,
        landSize: Number(landSize),
        paddyTypesCultivated: parsedPaddyTypes,
        estimatedMonthlyStock: Number(estimatedMonthlyStock),
        landDocument: req.file ? req.file.filename : null,
        verificationStatus: "PENDING"
      };
    }

    // ================= MILL OWNER =================
    if (normalizedRole === "MILL_OWNER") {
      userData.businessDetails = {
        businessName,
        businessRegistrationNumber,
        millLocation,
        businessDocument: req.file ? req.file.filename : null,
        verificationStatus: "PENDING"
      };
    }

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= LOGIN USER =================
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role !== "ADMIN") {
      let status = "PENDING";
      if (user.role === "FARMER") status = user.farmDetails?.verificationStatus || "PENDING";
      else if (user.role === "MILL_OWNER") status = user.businessDetails?.verificationStatus || "PENDING";

      if (status !== "APPROVED") {
        return res.status(403).json({ message: "Account not approved" });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        nic: user.nic,
        role: user.role,
        isVerified: user.isVerified,
        farmDetails: user.farmDetails || null,
        businessDetails: user.businessDetails || null
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= GET MY PROFILE =================
const getMyProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// ================= UPDATE PROFILE =================
const updateProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // ===== BASIC =====
    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;

    // ===== FARMER =====
    if (user.role === "FARMER" && user.farmDetails) {

      user.farmDetails.operatingDistrict =
        req.body.farmDetails?.operatingDistrict ||
        user.farmDetails.operatingDistrict;

      user.farmDetails.landSize =
        req.body.farmDetails?.landSize ||
        user.farmDetails.landSize;

      user.farmDetails.paddyTypesCultivated =
        req.body.farmDetails?.paddyTypesCultivated ||
        user.farmDetails.paddyTypesCultivated;

    }

    // ===== MILL OWNER =====
    if (user.role === "MILL_OWNER" && user.businessDetails) {

      user.businessDetails.businessName =
        req.body.businessDetails?.businessName ||
        user.businessDetails.businessName;

      user.businessDetails.millLocation =
        req.body.businessDetails?.millLocation ||
        user.businessDetails.millLocation;

      if (req.body.businessDetails?.millCapacity !== undefined)
        user.businessDetails.millCapacity = req.body.businessDetails.millCapacity;

      if (req.body.businessDetails?.businessPhone !== undefined)
        user.businessDetails.businessPhone = req.body.businessDetails.businessPhone;

    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// ================= UPLOAD AVATAR =================
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profileImage = req.file.filename;
    await user.save();

    res.status(200).json({
      message: "Avatar uploaded successfully",
      profileImage: req.file.filename
    });
  } catch (error) {
    console.error("UPLOAD AVATAR ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getMyProfile,
  updateProfile,
  uploadAvatar
};