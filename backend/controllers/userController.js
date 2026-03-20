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


    // ================= NORMALIZE ROLE =================

    const normalizedRole = role?.toUpperCase();


    // ================= CHECK EXISTING USER =================

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }


    // ================= HASH PASSWORD =================

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // ================= BASE USER OBJECT =================

    let userData = {
      fullName,
      email,
      phone,
      nic,
      password: hashedPassword,
      role: normalizedRole,
      isVerified: false
    };


    // ================= FARMER REGISTRATION =================

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


    // ================= MILL OWNER REGISTRATION =================

    if (normalizedRole === "MILL_OWNER") {

      userData.businessDetails = {

        businessName,

        businessRegistrationNumber,

        millLocation,

        businessDocument: req.file ? req.file.filename : null,

        verificationStatus: "PENDING"

      };

    }


    // ================= SAVE USER =================

    const newUser = new User(userData);

    await newUser.save();


    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {

    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};



// ================= LOGIN USER =================

const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }


    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }


    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
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
        role: user.role,
        isVerified: user.isVerified,

        farmDetails: user.farmDetails || null,
        businessDetails: user.businessDetails || null
      }

    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


module.exports = {
  registerUser,
  loginUser
};