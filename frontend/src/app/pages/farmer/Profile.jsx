import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function FarmerProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const token = localStorage.getItem("token");

  // ================= FETCH PROFILE =================
  const fetchProfile = async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      } else {
        setError(data.message || "Failed to load profile");
      }

    } catch (err) {
      console.error(err);
      setError("Network error loading profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleFarmChange = (e) => {
    setUser({
      ...user,
      farmDetails: {
        ...user.farmDetails,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handlePaddyChange = (e) => {
    setUser({
      ...user,
      farmDetails: {
        ...user.farmDetails,
        paddyTypesCultivated: e.target.value.split(",").map(item => item.trim()),
      },
    });
  };

  const handleBusinessChange = (e) => {
    setUser({
      ...user,
      businessDetails: {
        ...user.businessDetails,
        [e.target.name]: e.target.value,
      },
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setSuccessMsg(null);
      setError(null);
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Profile updated successfully");
        fetchProfile();
      } else {
        setError(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      setError("Error updating profile");
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-[#22C55E]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
    </div>
  );
  
  if (error && !user) return (
    <div className="max-w-[800px] mx-auto p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center flex flex-col items-center gap-3">
      <AlertCircle className="w-8 h-8" />
      <p>{error}</p>
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto pb-10">

      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {error && user && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* ================= PERSONAL ================= */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Full Name</label>
              <input
                name="fullName"
                value={user.fullName || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">NIC Number</label>
              <input
                value={user.nic || ""}
                disabled
                className="w-full px-4 py-3 bg-[#161a20] border border-transparent rounded-lg opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Email Address</label>
              <input
                value={user.email || ""}
                disabled
                className="w-full px-4 py-3 bg-[#161a20] border border-transparent rounded-lg opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Mobile Number</label>
              <input
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>
        </div>

        {/* ================= ROLE BASED INFO ================= */}
        {user.role === "FARMER" && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Farm Details</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Operating District</label>
                <input
                  name="operatingDistrict"
                  value={user.farmDetails?.operatingDistrict || ""}
                  onChange={handleFarmChange}
                  className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Land Size (Acres)</label>
                <input
                  type="number"
                  name="landSize"
                  value={user.farmDetails?.landSize || ""}
                  onChange={handleFarmChange}
                  className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium">Paddy Types Cultivated</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(user.farmDetails?.paddyTypesCultivated || []).map((type, idx) => (
                    type.trim() && (
                      <span key={idx} className="px-3 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] rounded-md text-sm">
                        {type.trim()}
                      </span>
                    )
                  ))}
                </div>
                <input
                  name="paddyTypesCultivated"
                  value={(user.farmDetails?.paddyTypesCultivated || []).join(", ")}
                  onChange={handlePaddyChange}
                  placeholder="e.g. Samba, Nadu, Keeri Samba"
                  className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E]"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Separate with commas
                </p>
              </div>
            </div>
          </div>
        )}

        {user.role === "MILL_OWNER" && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Business Details</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Business Name</label>
                <input
                  name="businessName"
                  value={user.businessDetails?.businessName || ""}
                  onChange={handleBusinessChange}
                  className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Mill Location</label>
                <input
                  name="millLocation"
                  value={user.businessDetails?.millLocation || ""}
                  onChange={handleBusinessChange}
                  className="w-full px-4 py-3 bg-[#161a20] border border-input rounded-lg focus:outline-none focus:border-[#22C55E]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= VERIFICATION ================= */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Verification Status</h2>

          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 border rounded-lg ${user.isVerified ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
              <div className="flex items-center gap-3">
                {user.isVerified ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                )}
                <div>
                  <h3 className="font-medium">Account Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.isVerified ? "Account is fully verified" : "Account verification pending"}
                  </p>
                </div>
              </div>

              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${user.isVerified ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                {user.isVerified ? "Active" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* ================= SAVE ================= */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-black rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}