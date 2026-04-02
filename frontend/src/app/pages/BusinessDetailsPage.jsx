import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sprout, Upload, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const SRI_LANKAN_DISTRICTS = [
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha",
  "Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala",
  "Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya",
  "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"
];

const PADDY_TYPES = [
  "Samba","Keeri Samba","Nadu","Red Rice","White Rice","Basmati","Suwandel"
];

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

    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <div className="flex items-center justify-between px-12 py-6 border-b border-border">

        <Link to="/" className="flex items-center gap-3">

          <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
            <Sprout className="w-6 h-6 text-[#0F1115]" />
          </div>

          <span className="text-2xl font-semibold">
            AgroBridge
          </span>

        </Link>

        <Link to="/" className="text-muted-foreground hover:text-foreground">
          Back to Home
        </Link>

      </div>



      {/* STEP PROGRESS */}
      <div className="max-w-2xl mx-auto mt-8 px-8">

        <div className="flex items-center justify-center gap-2 mb-2">

          <div className="w-8 h-8 bg-[#22C55E] text-[#0F1115] rounded-full flex items-center justify-center font-medium">
            ✓
          </div>

          <div className="w-20 h-1 bg-[#22C55E]"></div>

          <div className="w-8 h-8 bg-[#22C55E] text-[#0F1115] rounded-full flex items-center justify-center font-medium">
            ✓
          </div>

          <div className="w-20 h-1 bg-[#22C55E]"></div>

          <div className="w-8 h-8 bg-[#22C55E] text-[#0F1115] rounded-full flex items-center justify-center font-medium">
            3
          </div>

        </div>

        <p className="text-center text-sm text-muted-foreground">
          Step 3 of 3
        </p>

      </div>



      {/* CONTENT */}
      <div className="flex items-center justify-center px-12 py-12">

        <div className="w-full max-w-[720px]">

          <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">

            <h1 className="text-3xl font-semibold mb-2">
              Business Details
            </h1>

            <p className="text-muted-foreground mb-8">
              {role === "FARMER"
                ? "Tell us about your farming business"
                : "Tell us about your rice mill"}
            </p>


            <form onSubmit={handleSubmit} className="space-y-6">

              {/* FARMER FORM */}

              {role === "FARMER" && (

                <>

                  <div>
                    <label className="block mb-2">Operating District</label>
                    <select
                      name="district"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg bg-[#161a20]"
                      required
                    >
                      <option value="">Select district</option>

                      {SRI_LANKAN_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}

                    </select>
                  </div>


                  <div>
                    <label className="block mb-2">Land Size (Acres)</label>
                    <input
                      type="number"
                      name="landSize"
                      placeholder="e.g., 10"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg bg-[#161a20]"
                      required
                    />
                  </div>


                  <div>
                    <label className="block mb-3">
                      Paddy Types Cultivated
                    </label>

                    <div className="flex flex-wrap gap-2">

                      {PADDY_TYPES.map((type) => (

                        <button
                          key={type}
                          type="button"
                          onClick={() => togglePaddyType(type)}
                          className={`px-4 py-2 rounded-lg border ${
                            selectedPaddyTypes.includes(type)
                              ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]"
                              : "border-border"
                          }`}
                        >
                          {type}
                        </button>

                      ))}

                    </div>

                  </div>


                  <div>
                    <label className="block mb-2">
                      Estimated Monthly Paddy Stock (kg)
                    </label>

                    <input
                      type="number"
                      name="estimatedStock"
                      placeholder="e.g., 5000"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg bg-[#161a20]"
                      required
                    />
                  </div>

                </>
              )}



              {/* MILL OWNER FORM */}

              {role === "MILL_OWNER" && (

                <>

                  <div>
                    <label className="block mb-2">
                      Business Name
                    </label>

                    <input
                      name="businessName"
                      placeholder="Enter your rice mill name"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg bg-[#161a20]"
                      required
                    />
                  </div>


                  <div className="grid grid-cols-2 gap-6">

                    <div>
                      <label className="block mb-2">
                        Business Registration Number
                      </label>

                      <input
                        name="businessRegistrationNumber"
                        placeholder="e.g., BRN123456"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg bg-[#161a20]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2">
                        Mill Location (District)
                      </label>

                      <select
                        name="millLocation"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg bg-[#161a20]"
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

              <div className="border-t border-border pt-6">

                <h3 className="text-xl font-semibold mb-2">
                  {role === "FARMER"
                    ? "Land Ownership Verification"
                    : "Business Verification"}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">

                  {role === "FARMER"
                    ? "Upload Land Deed, Lease Agreement, or Government Farming Certificate"
                    : "Upload Business Registration Certificate, Rice Mill License, or Government Certification"}

                </p>


                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[#22C55E]/50">

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <label htmlFor="file-upload" className="cursor-pointer">

                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

                    <p className="font-medium">
                      Click to upload or drag and drop
                    </p>

                    <p className="text-sm text-muted-foreground">
                      PDF, JPG, or PNG (max 10MB)
                    </p>

                  </label>

                </div>

                {uploadedFile && (
                  <p className="text-sm text-[#22C55E] mt-3">
                    Selected file: {uploadedFile.name}
                  </p>
                )}

              </div>



              {/* BUTTONS */}

              <div className="flex gap-4 pt-4">

                <button
                  type="button"
                  onClick={() => navigate("/register/account")}
                  className="px-8 py-3 bg-muted rounded-lg"
                >
                  Previous
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg"
                >
                  Submit Registration
                </button>

              </div>

            </form>



            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 mt-6">

              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />

              <div>

                <h4 className="font-medium mb-1">
                  Administrative Verification Required
                </h4>

                <p className="text-sm text-muted-foreground">
                  Your account will be reviewed by AgroBridge administrators before trading access is granted.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}