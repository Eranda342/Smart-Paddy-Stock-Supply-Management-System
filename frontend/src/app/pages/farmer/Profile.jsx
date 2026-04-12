import { useEffect, useState, useRef } from "react";
import {
  CheckCircle2, AlertCircle, Loader2, Phone, Mail, Camera, User, Sprout,
  Edit2, Save, X, Eye, UploadCloud, RefreshCw, Key, LogOut, Clock,
  ShieldCheck, ShieldAlert, FileText, AlertTriangle, Activity, FileUp
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { FormInput } from "../../components/ui/form-fields";

const BASE_URL = "http://localhost:5000";
const PHONE_REGEX = /^(\+94|0)[0-9]{9}$/;

export default function FarmerProfile() {
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState(null);

  // Document replace
  const [documentFile, setDocumentFile] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
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
        setOriginalUser(JSON.parse(JSON.stringify(data.user)));
        setAvatarPreview(null);
        window.dispatchEvent(new Event("userUpdated"));
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
        toast.success("Profile photo updated \u2705");
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

  // ================= DOCUMENT REPLACE & RESUBMIT =================
  const handleDocChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleResubmit = async () => {
    if (!documentFile) {
      toast.error("Please select a replacement document first.");
      return;
    }
    setResubmitting(true);
    try {
      const formData = new FormData();
      formData.append("document", documentFile);
      if (user.phone) formData.append("phone", user.phone);
      if (user.nic) formData.append("nic", user.nic);
      if (user.farmDetails?.operatingDistrict) formData.append("operatingDistrict", user.farmDetails.operatingDistrict);

      const res = await fetch(`${BASE_URL}/api/users/resubmit`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Document replaced & resubmitted successfully \u2705");
        setDocumentFile(null);
        fetchProfile();
      } else {
        toast.error(data.message || "Resubmission failed");
      }
    } catch (err) {
      toast.error("Network error during resubmission");
    } finally {
      setResubmitting(false);
    }
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
        toast.success("Profile updated successfully \u2705");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setOriginalUser(JSON.parse(JSON.stringify(user)));
        setIsEditing(false);
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

  const handleCancel = () => {
    setUser(JSON.parse(JSON.stringify(originalUser)));
    setIsEditing(false);
  };



  // ================= STATS / HELPERS =================
  const getProfileCompletion = () => {
    if (!user) return { pct: 0, missing: [] };
    const missing = [];
    if (!user.fullName?.trim()) missing.push("Add your full name");
    if (!user.phone?.trim()) missing.push("Add a mobile number");
    if (!user.nic?.trim()) missing.push("Add a NIC number");

    if (!user.farmDetails?.operatingDistrict?.trim()) missing.push("Add your operating district");
    if (user.farmDetails?.landSize == null || user.farmDetails?.landSize <= 0) missing.push("Add land size");
    if (!user.farmDetails?.paddyTypesCultivated?.length) missing.push("Add cultivated paddy types");
    if (user.farmDetails?.estimatedMonthlyStock == null || user.farmDetails?.estimatedMonthlyStock <= 0) missing.push("Add estimated monthly stock");
    if (!user.farmDetails?.landDocument) missing.push("Upload land document");

    const totalFields = 8;
    const filledFields = totalFields - missing.length;
    const pct = Math.round((filledFields / totalFields) * 100);
    return { pct, missing };
  };

  // ================= AVATAR URL =================
  const avatarSrc = avatarPreview || (user?.profileImage ? `${BASE_URL}/uploads/${user.profileImage}` : null);

  // ================= LOADING / ERROR STATES =================
  if (loading) return (
    <div className="flex h-64 items-center justify-center text-[#22C55E]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
    </div>
  );

  if (error && !user) return (
    <div className="max-w-[1000px] mx-auto p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center flex flex-col items-center gap-3">
      <AlertCircle className="w-8 h-8" />
      <p>{error}</p>
    </div>
  );

  const { pct: completionPct, missing: missingFields } = getProfileCompletion();
  const vStatus = user?.farmDetails?.verificationStatus || "PENDING";
  const isRejected = vStatus === "REJECTED";

  return (
    <div className="max-w-[1000px] mx-auto pb-12 space-y-6">
      
      {/* 1. PROFILE HEADER (Premium Look) */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E]/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Avatar Section */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#22C55E]/20 bg-[#161a20] flex items-center justify-center shadow-2xl relative z-10">
            {uploadingAvatar ? (
              <Loader2 className="w-8 h-8 text-[#22C55E] animate-spin" />
            ) : avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1 text-white flex items-center justify-center md:justify-start gap-3">
                {user?.fullName || "Farmer"}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm mt-3">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
                  Farmer
                </span>
                {user?.emailVerified && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 rounded-full font-medium">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Verified
                  </span>
                )}
                {user?.isVerified && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 rounded-full font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Approved
                  </span>
                )}
              </div>
            </div>
            
            {/* Edit Profile Action */}
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="secondary" className="shrink-0 gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <Button onClick={handleCancel} variant="ghost" className="gap-2 border border-border">
                  <X className="w-4 h-4" /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} variant="primary" className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-black/20 border border-white/5 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">Profile Completion</span>
              <span className="text-[#22C55E] font-bold">{completionPct}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000" 
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {missingFields.length > 0 ? (
              <div className="text-sm">
                <p className="text-orange-400 font-semibold mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Action Required: Complete your profile
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-1">
                  {missingFields.map((field, idx) => (
                    <li key={idx} className="text-muted-foreground flex items-center gap-2 text-xs before:content-[''] before:w-1.5 before:h-1.5 before:bg-orange-500/50 before:rounded-full">
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-[#22C55E] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Profile is fully completed
              </div>
            )}
          </div>
        </div>
      </div>

      {error && user && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />{error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. EDIT MODE - PERSONAL INFO */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#22C55E]" /> Personal Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <FormInput label="Full Name" name="fullName" value={user?.fullName || ""} onChange={handleChange} disabled={!isEditing} />
              <FormInput label="NIC Number" value={user?.nic || ""} disabled title="NIC cannot be changed" />
              <FormInput label="Email Address" icon={<Mail className="w-3.5 h-3.5" />} value={user?.email || ""} disabled title="Email cannot be changed" />
              <FormInput label="Mobile Number" name="phone" value={user?.phone || ""} onChange={handleChange} disabled={!isEditing} placeholder="+94711234567" icon={<Phone className="w-3.5 h-3.5" />} error={user?.phone && !PHONE_REGEX.test(user.phone) ? "Invalid Format" : ""} />
            </div>
          </div>

          {/* 3. EDIT MODE - FARM DETAILS */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#22C55E]" /> Farm Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <FormInput label="Operating District" name="operatingDistrict" value={user?.farmDetails?.operatingDistrict || ""} onChange={handleFarmChange} disabled={!isEditing} placeholder="e.g. Colombo" />
              <FormInput label="Land Size (Acres)" name="landSize" type="number" min="0" value={user?.farmDetails?.landSize || ""} onChange={handleFarmChange} disabled={!isEditing} placeholder="e.g. 5" />
              <FormInput label="Est. Monthly Stock (kg)" name="estimatedMonthlyStock" type="number" min="0" value={user?.farmDetails?.estimatedMonthlyStock || ""} onChange={handleFarmChange} disabled={!isEditing} placeholder="e.g. 2000" />
              <div className="sm:col-span-2">
                <label className="block mb-2 text-sm font-medium">Paddy Types Cultivated</label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                  {(user?.farmDetails?.paddyTypesCultivated || []).map((type, idx) =>
                    type.trim() && (
                      <span key={idx} className="px-3 py-1 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] rounded-md text-xs font-medium">
                        {type.trim()}
                      </span>
                    )
                  )}
                </div>
                <FormInput name="paddyTypesCultivated" value={(user?.farmDetails?.paddyTypesCultivated || []).join(", ")} onChange={handlePaddyChange} disabled={!isEditing} placeholder="e.g. Samba, Nadu" />
                <p className="text-xs text-muted-foreground mt-1.5">Separate with commas</p>
              </div>
            </div>
            
            {/* Edit Save Footer Contextual */}
            {isEditing && (
              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
                <Button onClick={handleCancel} variant="ghost">Cancel</Button>
                <Button onClick={handleSave} disabled={saving} variant="primary" className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All Changes
                </Button>
              </div>
            )}
          </div>
          
          {/* 4. VERIFICATION & DOCUMENTS */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#22C55E]" /> Verification Status
            </h2>
            
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 ${vStatus === 'APPROVED' ? 'bg-green-500/10 border-green-500/20' : vStatus === 'REJECTED' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
              <div className="flex gap-4">
                {vStatus === "APPROVED" && <CheckCircle2 className="w-10 h-10 text-green-500 shrink-0" />}
                {vStatus === "REJECTED" && <ShieldAlert className="w-10 h-10 text-red-500 shrink-0" />}
                {vStatus === "PENDING" && <Clock className="w-10 h-10 text-yellow-500 shrink-0" />}
                
                <div>
                  <h3 className="font-semibold text-lg">Account Verification</h3>
                  <p className="text-sm text-white/70 mt-1">
                    {vStatus === "APPROVED" && "Your account is fully verified and active."}
                    {vStatus === "PENDING" && "Your documents are currently under review by our admin team."}
                    {vStatus === "REJECTED" && "Your application was rejected. Please review the reason below and resubmit."}
                  </p>
                  {isRejected && user?.farmDetails?.rejectionReason && (
                    <div className="mt-3 flex gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{user.farmDetails.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shrink-0 ${vStatus === 'APPROVED' ? 'bg-green-500/20 text-green-500' : vStatus === 'REJECTED' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                {vStatus}
              </span>
            </div>

            {/* Document Handling */}
            <div>
              <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Submitted Land Document</h3>
              
              <div className="flex justify-between items-center bg-black/20 border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#22C55E]/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white max-w-[150px] sm:max-w-[300px] truncate">
                      {user?.farmDetails?.landDocument || "No document uploaded"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  {user?.farmDetails?.landDocument && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => window.open(`${BASE_URL}/uploads/${user.farmDetails.landDocument}`, "_blank")}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" /> View
                    </Button>
                  )}
                  {/* Replace Button always available, calls resubmit endpoint which sets to PENDING */}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" ref={docInputRef} onChange={handleDocChange} />
                  
                  {documentFile ? (
                    <Button variant="primary" size="sm" onClick={handleResubmit} disabled={resubmitting} className="gap-2 bg-orange-600 hover:bg-orange-500 text-white">
                      {resubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Upload
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => docInputRef.current?.click()} className="gap-2 border-border">
                      <UploadCloud className="w-4 h-4" /> Replace
                    </Button>
                  )}
                </div>
              </div>
              {documentFile && (
                 <p className="text-xs text-orange-400 mt-2 font-medium">
                   Selected: {documentFile.name}. Click 'Upload' to confirm replacement.
                 </p>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR COL */}
        <div className="space-y-6">
          
          {/* 5. RECENT ACTIVITY (Frontend Mock safe) */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
               <Activity className="w-5 h-5 text-[#22C55E]" /> Recent Activity
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {user?.isVerified && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                    <p className="font-medium text-sm text-white">Verification Approved</p>
                    <time className="text-xs text-white/50">Account verified by admin.</time>
                  </div>
                </div>
              )}
              {user?.farmDetails?.landDocument && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                    <p className="font-medium text-sm text-white">Document Submitted</p>
                    <time className="text-xs text-white/50">Land document uploaded.</time>
                  </div>
                </div>
              )}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 text-orange-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                    <p className="font-medium text-sm text-white">Profile Created</p>
                    <time className="text-xs text-white/50">Account registered.</time>
                  </div>
                </div>
            </div>
          </div>



        </div>
      </div>

    </div>
  );
}