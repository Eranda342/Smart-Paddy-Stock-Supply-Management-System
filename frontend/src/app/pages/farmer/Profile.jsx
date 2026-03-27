import { useEffect, useState, useRef } from "react";
import {
  CheckCircle2, AlertCircle, Loader2,
  Phone, Mail, Camera, User, Sprout
} from "lucide-react";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:5000";
const PHONE_REGEX = /^(\+94|0)[0-9]{9}$/;

export default function FarmerProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  // ================= FETCH PROFILE =================
  const fetchProfile = async () => {
    try {
      setError(null);
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setAvatarPreview(null);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      setError("Network error loading profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================= CHANGE HANDLERS =================
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFarmChange = (e) => {
    setUser({
      ...user,
      farmDetails: { ...user.farmDetails, [e.target.name]: e.target.value },
    });
  };

  const handlePaddyChange = (e) => {
    setUser({
      ...user,
      farmDetails: {
        ...user.farmDetails,
        paddyTypesCultivated: e.target.value.split(",").map((item) => item.trim()),
      },
    });
  };

  // ================= AVATAR PREVIEW =================
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ================= AVATAR UPLOAD =================
  const handleAvatarUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${BASE_URL}/api/users/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Profile photo updated ✅");
        fetchProfile();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Network error during upload");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileChange = async (e) => {
    handleAvatarSelect(e);
    await new Promise((r) => setTimeout(r, 100));
    await handleAvatarUpload();
  };

  // ================= VALIDATION =================
  const validate = () => {
    if (!user.fullName?.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (user.phone && !PHONE_REGEX.test(user.phone)) {
      toast.error("Invalid phone number. Use format: +94XXXXXXXXX or 0XXXXXXXXX");
      return false;
    }
    return true;
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      setError(null);
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully ✅");
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchProfile();
      } else {
        toast.error(data.message || "Update failed");
        setError(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating profile");
      setError("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  // ================= AVATAR URL =================
  const avatarSrc = avatarPreview
    || (user?.profileImage ? `${BASE_URL}/uploads/${user.profileImage}` : null);

  // ================= LOADING / ERROR STATES =================
  if (loading) return (
    <div className="flex h-64 items-center justify-center text-[#22C55E]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
    </div>
  );

  if (error && !user) return (
    <div className="max-w-[900px] mx-auto p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center flex flex-col items-center gap-3">
      <AlertCircle className="w-8 h-8" />
      <p>{error}</p>
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto pb-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {error && user && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />{error}
        </div>
      )}

      <div className="space-y-6">

        {/* ===== AVATAR SECTION ===== */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Photo</h2>
          <div className="flex items-center gap-6">

            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#22C55E]/40 bg-[#161a20] flex items-center justify-center">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 text-[#22C55E] animate-spin" />
                ) : avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">{user?.fullName || "Farmer"}</p>
              <p className="text-xs text-muted-foreground mb-3">
                {user?.farmDetails?.operatingDistrict
                  ? `${user.farmDetails.operatingDistrict} District`
                  : "Location not set"}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 text-sm bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] rounded-lg hover:bg-[#22C55E]/20 transition-colors flex items-center gap-2"
              >
                {uploadingAvatar ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                ) : (
                  <><Camera className="w-3.5 h-3.5" /> Change Photo</>
                )}
              </button>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or GIF · Max 5MB</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* ===== PERSONAL INFO ===== */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                value={user?.fullName || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-muted-foreground">NIC Number</label>
              <input
                value={user?.nic || ""}
                disabled
                className="w-full px-4 py-3 bg-[#161a20] border border-transparent rounded-lg opacity-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 mb-2 text-sm font-medium text-muted-foreground">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 bg-[#161a20] border border-transparent rounded-lg opacity-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 mb-2 text-sm font-medium">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Mobile Number
              </label>
              <input
                name="phone"
                value={user?.phone || ""}
                onChange={handleChange}
                placeholder="+94711234567 or 0711234567"
                className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
              />
              {user?.phone && !PHONE_REGEX.test(user.phone) && (
                <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Use format: +94XXXXXXXXX or 0XXXXXXXXX
                </p>
              )}
            </div>

          </div>
        </div>

        {/* ===== FARM DETAILS ===== */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sprout className="w-5 h-5 text-[#22C55E]" />
            <h2 className="text-xl font-semibold">Farm Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 text-sm font-medium">Operating District</label>
              <input
                name="operatingDistrict"
                value={user?.farmDetails?.operatingDistrict || ""}
                onChange={handleFarmChange}
                placeholder="e.g. Colombo"
                className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Land Size (Acres)</label>
              <input
                type="number"
                name="landSize"
                min="0"
                value={user?.farmDetails?.landSize || ""}
                onChange={handleFarmChange}
                placeholder="e.g. 5"
                className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Est. Monthly Stock (kg)</label>
              <input
                type="number"
                name="estimatedMonthlyStock"
                min="0"
                value={user?.farmDetails?.estimatedMonthlyStock || ""}
                onChange={handleFarmChange}
                placeholder="e.g. 2000"
                className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2 text-sm font-medium">Paddy Types Cultivated</label>
              {/* Tag display */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                {(user?.farmDetails?.paddyTypesCultivated || []).map((type, idx) =>
                  type.trim() && (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] rounded-md text-sm"
                    >
                      {type.trim()}
                    </span>
                  )
                )}
              </div>
              <input
                name="paddyTypesCultivated"
                value={(user?.farmDetails?.paddyTypesCultivated || []).join(", ")}
                onChange={handlePaddyChange}
                placeholder="e.g. Samba, Nadu, Keeri Samba"
                className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Separate multiple types with commas</p>
            </div>

          </div>
        </div>

        {/* ===== VERIFICATION STATUS ===== */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Verification Status</h2>

          <div className={`flex items-center justify-between p-4 border rounded-xl ${
            user?.isVerified
              ? "bg-green-500/10 border-green-500/20"
              : "bg-yellow-500/10 border-yellow-500/20"
          }`}>
            <div className="flex items-center gap-3">
              {user?.isVerified
                ? <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                : <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
              }
              <div>
                <h3 className="font-medium">Account Verification</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.isVerified
                    ? "Your account is verified and active on AgroBridge"
                    : "Pending — an admin will review your submitted documents"}
                </p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold shrink-0 ${
              user?.isVerified
                ? "bg-green-500/20 text-green-500"
                : "bg-yellow-500/20 text-yellow-500"
            }`}>
              {user?.isVerified ? "Verified ✓" : "Pending"}
            </span>
          </div>
        </div>

        {/* ===== SAVE BUTTON ===== */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              saving
                ? "bg-[#22C55E]/50 text-black/60 cursor-not-allowed"
                : "bg-[#22C55E] hover:bg-[#16A34A] text-black hover:scale-[1.02] active:scale-95"
            }`}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}