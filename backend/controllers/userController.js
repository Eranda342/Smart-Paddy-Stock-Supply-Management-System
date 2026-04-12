const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { generateEmailToken, sendVerificationEmail } = require("../utils/authUtils");

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
      isVerified: false,
      emailVerified: false
    };

    const { token, hashedToken, expire } = generateEmailToken();
    userData.emailVerificationToken = hashedToken;
    userData.emailVerificationExpire = expire;

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

    try {
      await sendVerificationEmail(newUser, token);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
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
        emailVerified: user.emailVerified,
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


// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "There is no user with that email" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set expire (15 minutes)
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset url (Fallback to port 3000 if not in env)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a request to: \n\n ${resetUrl}\n\nThis link will expire in 15 minutes.\nIf you didn't request this, ignore this email.`;

    const htmlMessage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              
              <!-- MAIN CONTAINER -->
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- HEADER -->
                <tr>
                  <td align="center" style="padding: 30px 40px; background-color: #f0fdf4; border-bottom: 1px solid #dcfce7;">
                    <h1 style="color: #166534; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">AgroBridge</h1>
                    <p style="color: #22c55e; font-size: 14px; font-weight: 500; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Smart Paddy Stock & Supply Platform</p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding: 40px;">
                    
                    <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">Reset Your Password</h2>
                    
                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Hi ${user.fullName || "there"}, 👋
                    </p>
                    
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                      We received a request to reset your password for your AgroBridge account. You can easily create a new password by clicking the secure link below.
                    </p>

                    <!-- BUTTON -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 32px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" bgcolor="#22c55e" style="border-radius: 8px; background: linear-gradient(to right, #22c55e, #16a34a); box-shadow: 0 4px 14px 0 rgba(34, 197, 94, 0.39);">
                                <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                  Reset Password
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- BACKUP LINK -->
                    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 32px; word-break: break-all;">
                      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">Button not working? Copy and paste this link:</p>
                      <a href="${resetUrl}" style="color: #3b82f6; font-size: 13px; text-decoration: underline;">${resetUrl}</a>
                    </div>

                    <!-- SECURITY NOTICE -->
                    <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 4px;">
                      <p style="color: #9a3412; font-size: 14px; margin: 0 0 6px 0; font-weight: 600;">Security Notice</p>
                      <ul style="margin: 0; padding-left: 20px; color: #c2410c; font-size: 13px; line-height: 1.5;">
                        <li>This password reset link will expire in exactly <strong>15 minutes</strong> for your security.</li>
                        <li>If you did not request a password reset, you can safely ignore this email. Your password will remain completely secure.</li>
                      </ul>
                    </div>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td align="center" style="padding: 24px 40px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">AgroBridge</p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">Secure • Transparent • Efficient</p>
                    <p style="color: #cbd5e1; font-size: 11px; margin: 16px 0 0 0;">&copy; ${new Date().getFullYear()} AgroBridge. All rights reserved.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Your Password - AgroBridge",
        message: message,
        html: htmlMessage
      });

      res.status(200).json({ message: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "Email could not be sent" });
    }

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ================= SET ROLE (OAuth onboarding — no checkApproved) =================
// PUT /api/users/set-role
// Allows a new Google OAuth user to assign themselves a FARMER or MILL_OWNER role.
// Protected by JWT (protect) but NOT checkApproved — the account is still PENDING.
const setRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ["FARMER", "MILL_OWNER"];
    if (!role || !allowedRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ message: "role must be FARMER or MILL_OWNER." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Security: only allow role assignment for Google OAuth accounts
    if (!user.googleId) {
      return res.status(403).json({ message: "Role is fixed for email/password accounts." });
    }

    user.role = role.toUpperCase();
    await user.save({ validateBeforeSave: false });

    const updated = await User.findById(user._id).select("-password");
    return res.status(200).json({ message: "Role set successfully", user: updated });
  } catch (error) {
    console.error("SET ROLE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ================= GET OWN PROFILE (no checkApproved — for onboarding) =================
// GET /api/users/profile
// Used by OAuthSuccessPage and onboarding pages to fetch the full user object
// regardless of verificationStatus. Regular /me has checkApproved which blocks
// PENDING/REJECTED users.
const getOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("GET OWN PROFILE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ================= UPDATE BASIC INFO (OAuth onboarding — no checkApproved) =================
// PUT /api/users/profile
// Called by AccountInfoPage for Google OAuth users to persist phone + NIC to the DB
// immediately, so subsequent DB-driven guards can read the correct fields.
// Also accepts optional fullName and password.
const updateBasicInfo = async (req, res) => {
  try {
    const { phone, nic, fullName, password } = req.body;

    if (!phone || !nic) {
      return res.status(400).json({ message: "phone and nic are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.phone = phone.trim();
    user.nic   = nic.trim();
    if (fullName && fullName.trim()) user.fullName = fullName.trim();

    if (password && password.trim().length >= 6) {
      const bcrypt = require("bcryptjs");
      const salt   = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    await user.save({ validateBeforeSave: false });

    const updated = await User.findById(user._id).select("-password");
    return res.status(200).json({ message: "Basic info updated", user: updated });
  } catch (error) {
    console.error("UPDATE BASIC INFO ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ================= RESUBMIT APPLICATION (REJECTED users only) =================
// PUT /api/users/resubmit
// Allows a previously REJECTED user to upload a new document and move back to PENDING.
// Uses protect only (no checkApproved) — REJECTED users cannot pass checkApproved.
// Accepts multipart/form-data; file field name must be "document".
const resubmit = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isFarmer    = user.role === "FARMER";
    const isMill      = user.role === "MILL_OWNER";

    if (!isFarmer && !isMill) {
      return res.status(400).json({ message: "Invalid role for resubmission." });
    }

    const currentStatus = isFarmer
      ? user.farmDetails?.verificationStatus
      : user.businessDetails?.verificationStatus;

    if (currentStatus !== "REJECTED") {
      return res.status(400).json({
        message: "Only rejected applications can be resubmitted.",
      });
    }

    // ─── Update optional basic-info fields ──────────────────────────────────
    const { phone, nic, operatingDistrict, millLocation } = req.body;
    if (phone) user.phone = phone.trim();
    if (nic)   user.nic   = nic.trim();

    // ─── New document file (required) ───────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        message: "Document is required for resubmission"
      });
    }
    const newDocFilename = req.file.filename;

    // ─── Reset verification status and clear rejection reason ───────────────
    if (isFarmer) {
      user.farmDetails.operatingDistrict  = operatingDistrict || user.farmDetails.operatingDistrict;
      user.farmDetails.landDocument       = newDocFilename;
      user.farmDetails.verificationStatus = "PENDING";
      delete user.farmDetails.rejectionReason;
    } else {
      user.businessDetails.millLocation        = millLocation || user.businessDetails.millLocation;
      user.businessDetails.businessDocument    = newDocFilename;
      user.businessDetails.verificationStatus  = "PENDING";
      delete user.businessDetails.rejectionReason;
    }

    user.isVerified = false; // admin must re-approve
    await user.save({ validateBeforeSave: false });

    const updated = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Application resubmitted successfully. Awaiting admin review.",
      user: updated,
    });
  } catch (error) {
    console.error("RESUBMIT ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




// ================= VERIFY EMAIL =================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= RESEND VERIFICATION EMAIL =================
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const { token, hashedToken, expire } = generateEmailToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpire = expire;

    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user, token);
      res.status(200).json({ message: "Verification email sent successfully" });
    } catch (err) {
      console.error("Failed to resend verification email:", err);
      res.status(500).json({ message: "Failed to send verification email" });
    }

  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= DELETE ACCOUNT =================
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMyProfile,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
  setRole,
  getOwnProfile,
  updateBasicInfo,
  resubmit,
  verifyEmail,
  resendVerification,
  deleteAccount,
};