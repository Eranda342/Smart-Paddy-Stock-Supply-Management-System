const User = require("../models/User");

// Get all unverified users
const getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: false });

    res.status(200).json({
      count: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify user
const verifyUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      message: "User verified successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUnverifiedUsers,
  verifyUser
};
