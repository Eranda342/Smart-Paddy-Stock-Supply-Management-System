const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, nic, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      fullName,
      email,
      phone,
      nic,
      password,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser };
