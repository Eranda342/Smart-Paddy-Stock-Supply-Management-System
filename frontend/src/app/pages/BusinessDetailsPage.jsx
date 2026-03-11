import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sprout, Upload, AlertCircle } from 'lucide-react';

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const PADDY_TYPES = [
  'Samba', 'Keeri Samba', 'Nadu', 'Red Rice', 'White Rice', 'Basmati', 'Suwandel'
];

export default function BusinessDetailsPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [selectedPaddyTypes, setSelectedPaddyTypes] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    const savedRole = sessionStorage.getItem('selectedRole') || 'farmer';
    setRole(savedRole);
  }, []);

  const togglePaddyType = (type) => {
    setSelectedPaddyTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/register/success');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-12 py-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
            <Sprout className="w-6 h-6 text-[#0F1115]" />
          </div>
          <span className="text-2xl font-semibold">AgroBridge</span>
        </Link>
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Back to Home
        </Link>
      </div>

      {/* Progress Indicator */}
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
        <p className="text-center text-sm text-muted-foreground">Step 3 of 3</p>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-12 py-12">
        <div className="w-full max-w-[720px]">
          <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
            <h1 className="text-3xl font-semibold mb-2">Business Details</h1>
            <p className="text-muted-foreground mb-8">
              {role === 'farmer' ? 'Tell us about your farming business' : 'Tell us about your rice mill'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {role === 'farmer' ? (
                <>
                  {/* Farmer Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2">Operating District</label>
                      <select 
                        className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                        required
                      >
                        <option value="">Select district</option>
                        {SRI_LANKAN_DISTRICTS.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2">Land Size (Acres)</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                        placeholder="e.g., 10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-3">Paddy Types Cultivated</label>
                    <div className="flex flex-wrap gap-2">
                      {PADDY_TYPES.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => togglePaddyType(type)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                            selectedPaddyTypes.includes(type)
                              ? 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]'
                              : 'bg-muted border-border hover:border-[#22C55E]/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Estimated Monthly Paddy Stock (kg)</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                      placeholder="e.g., 5000"
                      required
                    />
                  </div>

                  {/* Land Verification Upload */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-xl font-semibold mb-2">Land Ownership Verification</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload Land Deed, Lease Agreement, or Government Farming Certificate
                    </p>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[#22C55E]/50 transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        {uploadedFile ? (
                          <p className="text-foreground font-medium">{uploadedFile.name}</p>
                        ) : (
                          <>
                            <p className="text-foreground font-medium mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PDF, JPG, or PNG (max 10MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Mill Owner Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block mb-2">Business Name</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        placeholder="Enter your rice mill name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2">Business Registration Number</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        placeholder="e.g., BRN123456"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2">Mill Location (District)</label>
                      <select 
                        className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        required
                      >
                        <option value="">Select district</option>
                        {SRI_LANKAN_DISTRICTS.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Business Verification Upload */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-xl font-semibold mb-2">Business Verification</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload Business Registration Certificate, Rice Mill License, or Government Certification
                    </p>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[#22C55E]/50 transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        {uploadedFile ? (
                          <p className="text-foreground font-medium">{uploadedFile.name}</p>
                        ) : (
                          <>
                            <p className="text-foreground font-medium mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PDF, JPG, or PNG (max 10MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Verification Notice */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Administrative Verification Required</h4>
                  <p className="text-sm text-muted-foreground">
                    Your account will be reviewed by AgroBridge administrators before trading access is granted.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/register/account')}
                  className="px-8 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
