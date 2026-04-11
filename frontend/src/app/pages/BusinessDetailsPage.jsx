import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Upload, AlertCircle } from "lucide-react";
import Logo from "../components/ui/Logo";
import toast from "react-hot-toast";
import { PADDY_TYPES_GROUPED, DISTRICTS as SRI_LANKAN_DISTRICTS } from "../../constants/paddyTypes";

export default function BusinessDetailsPage() {

  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [selectedPaddyTypes, setSelectedPaddyTypes] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [formData, setFormData] = useState({
    district: "",
    landSize: "",
    estimatedStock: "",
    businessName: "",
    businessRegistrationNumber: "",
    millLocation: ""
  });

  useEffect(() => {

    const savedRole = localStorage.getItem("role");
    const accountInfo = localStorage.getItem("accountInfo");

    if (!savedRole) {
      navigate("/register/role");
      return;
    }

    if (!accountInfo) {
      navigate("/register/account");
      return;
    }

    const normalizedRole = savedRole.toUpperCase().replace("-", "_");

    setRole(normalizedRole);

  }, [navigate]);



  const togglePaddyType = (type) => {
    setSelectedPaddyTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleFileChange = (e) => {

    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    const accountInfo = JSON.parse(localStorage.getItem("accountInfo"));

    if (!accountInfo) {
      toast.error("Missing account information", {
        style: { borderRadius: "8px", background: "#1f2937", color: "#fff" }
      });
      navigate("/register/account");
      return;
    }

    const formDataToSend = new FormData();

    formDataToSend.append("fullName", accountInfo.fullName);
    formDataToSend.append("email", accountInfo.email);
    formDataToSend.append("phone", accountInfo.phone);
    formDataToSend.append("nic", accountInfo.nic);
    formDataToSend.append("password", accountInfo.password);
    formDataToSend.append("role", role);


    if (role === "FARMER") {

      formDataToSend.append("operatingDistrict", formData.district);
      formDataToSend.append("landSize", formData.landSize);
      formDataToSend.append("estimatedMonthlyStock", formData.estimatedStock);
      formDataToSend.append("paddyTypesCultivated", JSON.stringify(selectedPaddyTypes));

    }


    if (role === "MILL_OWNER") {

      formDataToSend.append("businessName", formData.businessName);
      formDataToSend.append("businessRegistrationNumber", formData.businessRegistrationNumber);
      formDataToSend.append("millLocation", formData.millLocation);

    }


    if (uploadedFile) {
      formDataToSend.append("document", uploadedFile);
    }


    try {

      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formDataToSend
      });

      const data = await res.json();

      if (res.ok) {

        localStorage.removeItem("accountInfo");
        localStorage.removeItem("role");

        navigate("/register/success");

      } else {

        toast.error(data.message || "Registration failed", {
          style: { borderRadius: "8px", background: "#1f2937", color: "#fff" }
        });

      }

    } catch (error) {

      console.error(error);
      toast.error("Server error", {
        style: { borderRadius: "8px", background: "#1f2937", color: "#fff" }
      });

    }

  };



  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden relative">

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?auto=format&fit=crop&w=1080&q=80')",
          }}
        />
        {/* Soft Gradient Overlay matching dark theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/80 via-[#020617]/60 to-[#020617]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020617]" />
        
        <div className="absolute bottom-16 left-12 right-12 z-10">
          <div className="opacity-100 translate-y-0 transition-all duration-700">
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight text-white/95">
              Secure &amp; Transparent <span className="text-green-400">Transactions</span>
            </h2>
            <p className="text-lg text-white/70 font-medium">
              We verify all our partners to ensure the highest level of trust in the marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 flex flex-col relative z-10 min-h-screen overflow-y-auto">

        {/* Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-10 w-full">
          
          <div className="w-full max-w-2xl">
            {/* Minimal Logo */}
            <div className="flex justify-center mb-8">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo size="md" />
              </Link>
            </div>

            {/* PROGRESS BAR */}
            <div className="mb-10 w-full">
              <div className="flex items-center justify-center gap-2 mb-3">
                {/* Step 1 Passed */}
                <div className="w-8 h-8 bg-green-500/20 border-2 border-green-500 text-green-400 rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="w-16 sm:w-24 h-1 bg-green-500 rounded-full relative overflow-hidden" />
                {/* Step 2 Passed */}
                <div className="w-8 h-8 bg-green-500/20 border-2 border-green-500 text-green-400 rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="w-16 sm:w-24 h-1 bg-green-500 rounded-full relative overflow-hidden" />
                {/* Step 3 Active */}
                <div className="w-8 h-8 bg-green-500 text-[#020617] rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                  3
                </div>
              </div>
              <p className="text-center text-sm text-white/40 font-medium tracking-wide uppercase">
                Step 3 of 3 <span className="mx-2">•</span> Business Details
              </p>
            </div>

            {/* CONTENT CARD */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden w-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

              <h1 className="text-3xl font-bold mb-2 tracking-tight text-white">
                Business Details
              </h1>

              <p className="text-white/50 mb-8 font-medium">
                {role === "FARMER"
                  ? "Tell us about your farming business"
                  : "Tell us about your rice mill"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* FARMER FORM */}
                {role === "FARMER" && (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-white/70">Operating District</label>
                      <select
                        name="district"
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                        required
                      >
                        <option value="">Select district</option>
                        {SRI_LANKAN_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-white/70">Land Size (Acres)</label>
                      <input
                        type="number"
                        name="landSize"
                        placeholder="e.g., 10"
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-3 text-sm font-medium text-white/70">
                        Paddy Types Cultivated
                        {selectedPaddyTypes.length > 0 && (
                          <span className="ml-2 text-xs text-green-400 font-normal">
                            {selectedPaddyTypes.length} selected
                          </span>
                        )}
                      </label>

                      <div className="space-y-4">
                        {Object.entries(PADDY_TYPES_GROUPED).map(([group, types]) => (
                          <div key={group}>
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">
                              {group}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {types.map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => togglePaddyType(type)}
                                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all focus:outline-none ${
                                    selectedPaddyTypes.includes(type)
                                      ? "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-white/70">
                        Estimated Monthly Paddy Stock (kg)
                      </label>
                      <input
                        type="number"
                        name="estimatedStock"
                        placeholder="e.g., 5000"
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                        required
                      />
                    </div>
                  </>
                )}

                {/* MILL OWNER FORM */}
                {role === "MILL_OWNER" && (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-white/70">
                        Business Name
                      </label>
                      <input
                        name="businessName"
                        placeholder="Enter your rice mill name"
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-white/70">
                          Business Registration Number
                        </label>
                        <input
                          name="businessRegistrationNumber"
                          placeholder="e.g., BRN123456"
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-white/70">
                          Mill Location (District)
                        </label>
                        <select
                          name="millLocation"
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                          required
                        >
                          <option value="">Select district</option>
                          {SRI_LANKAN_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* DOCUMENT UPLOAD */}
                <div className="border-t border-white/10 pt-6 mt-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {role === "FARMER"
                      ? "Land Ownership Verification"
                      : "Business Verification"}
                  </h3>
                  <p className="text-sm text-white/50 mb-4">
                    {role === "FARMER"
                      ? "Upload Land Deed, Lease Agreement, or Government Farming Certificate"
                      : "Upload Business Registration Certificate, Rice Mill License, or Government Certification"}
                  </p>

                  <div className="border-2 border-dashed border-white/20 bg-white/5 rounded-xl p-8 text-center hover:border-green-500/50 hover:bg-green-500/5 transition-all group">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-12 h-12 bg-white/10 group-hover:bg-green-500/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                        <Upload className="w-6 h-6 text-white/60 group-hover:text-green-400 transition-colors" />
                      </div>
                      <p className="font-medium text-white/90 group-hover:text-white transition-colors">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-white/40 mt-1">
                        PDF, JPG, or PNG (max 10MB)
                      </p>
                    </label>
                  </div>

                  {uploadedFile && (
                    <div className="mt-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg inline-flex items-center gap-2">
                       <p className="text-sm text-green-400">
                         {uploadedFile.name}
                       </p>
                    </div>
                  )}
                </div>

                {/* ADVISORY CARD */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex gap-3 mt-6">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white/90 mb-1">
                      Administrative Verification Required
                    </h4>
                    <p className="text-sm text-white/60">
                      Your account will be reviewed by AgroBridge administrators before trading access is granted.
                    </p>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-4 pt-6 border-t border-white/10 mt-6 md:mt-8">
                  <button
                    type="button"
                    onClick={() => navigate("/register/account")}
                    className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617] focus:ring-green-500"
                  >
                    Submit Registration
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}