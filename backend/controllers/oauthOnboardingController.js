const bcrypt = require("bcryptjs");
const User = require("../models/User");

/**
 * PUT /api/auth/complete-profile
 *
 * Finalises a new Google OAuth user's profile after they complete the
 * existing registration form (RoleSelectionPage → AccountInfoPage → BusinessDetailsPage).
 *
 * This endpoint is intentionally aligned with POST /api/users/register so that
 * BusinessDetailsPage can call either endpoint depending on the auth context.
 *
 * Security:
 *  - Requires valid JWT  (protect middleware applied in route)
 *  - Does NOT require checkApproved (user is still PENDING at this point)
 *  - Cannot self-assign ADMIN role
 *  - Only operates on accounts with a googleId (blocks regular users)
 *
 * Accepts multipart/form-data (same shape as /api/users/register):
 *   Field       Description
 *   ─────────── ──────────────────────────────
 *   role        "FARMER" or "MILL_OWNER"
 *   phone       required
 *   nic         required
 *   password    optional – hashed and stored if provided
 *   fullName    optional – updates display name
 *
 *   FARMER-specific:
 *   operatingDistrict, landSize, estimatedMonthlyStock, paddyTypesCultivated
 *
 *   MILL_OWNER-specific:
 *   businessName, businessRegistrationNumber, millLocation
 *
 *   File field:
 *   document    land deed (FARMER) or business cert (MILL_OWNER)
 */
const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ── Security: only Google OAuth users may use this endpoint ──
    if (!user.googleId) {
      return res.status(403).json({
        message: "This endpoint is only available for Google OAuth accounts.",
      });
    }

    const { fullName, password } = req.body;

    // ── Security: role comes from the DB (set by PUT /users/set-role) ──
    // We do NOT trust req.body.role so users cannot change their role at this step.
    const allowedRoles = ["FARMER", "MILL_OWNER"];
    const normalizedRole = user.role;
    if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: "Role not set. Please select your role first." });
    }

    // ── phone and nic are already in the DB (saved by PUT /users/profile) ──
    // Still validate they are present before proceeding.
    if (!user.phone || !user.nic) {
      return res.status(400).json({ message: "Basic info (phone, NIC) not found. Please complete step 2." });
    }

    // ── Optional: update fullName and set a password for email/password login ──
    if (fullName && fullName.trim()) user.fullName = fullName.trim();

    // ── Optionally store a password so the account can also use email/password login ──
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    // ── Uploaded document filename (from multer) ──
    const documentFilename = req.file ? req.file.filename : null;

    // ── Role-specific details ──
    if (normalizedRole === "FARMER") {
      const {
        operatingDistrict,
        landSize,
        estimatedMonthlyStock,
        paddyTypesCultivated,
      } = req.body;

      let parsedPaddyTypes = [];
      if (paddyTypesCultivated) {
        try {
          parsedPaddyTypes = JSON.parse(paddyTypesCultivated);
        } catch {
          parsedPaddyTypes = [paddyTypesCultivated];
        }
      }

      user.farmDetails = {
        operatingDistrict: operatingDistrict || "",
        landSize: Number(landSize) || 0,
        estimatedMonthlyStock: Number(estimatedMonthlyStock) || 0,
        paddyTypesCultivated: parsedPaddyTypes,
        landDocument: documentFilename,           // ← completion signal
        verificationStatus: "PENDING",
        rejectionReason: null,
      };

      user.businessDetails = undefined; // clear if role switched
    }

    if (normalizedRole === "MILL_OWNER") {
      const { businessName, businessRegistrationNumber, millLocation } = req.body;

      user.businessDetails = {
        businessName: (businessName || "").trim(),
        businessRegistrationNumber: (businessRegistrationNumber || "").trim(),
        millLocation: millLocation || "",
        businessDocument: documentFilename,       // ← completion signal
        verificationStatus: "PENDING",
        rejectionReason: null,
      };

      user.farmDetails = undefined; // clear if role switched
    }

    await user.save({ validateBeforeSave: false });

    // Return the sanitised, updated user object
    const updated = await User.findById(userId).select("-password");

    return res.status(200).json({
      message: "Profile completed successfully",
      user: updated,
    });
  } catch (error) {
    console.error("COMPLETE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { completeProfile };
