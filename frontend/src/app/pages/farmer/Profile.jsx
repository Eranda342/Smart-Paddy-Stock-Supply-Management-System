import { CheckCircle2, XCircle, Upload } from 'lucide-react';

export default function FarmerProfile() {
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">NIC Number</label>
              <input
                type="text"
                defaultValue="123456789V"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                disabled
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Email Address</label>
              <input
                type="email"
                defaultValue="john.doe@email.com"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Mobile Number</label>
              <input
                type="tel"
                defaultValue="+94 77 123 4567"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Business Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Operating District</label>
              <input
                type="text"
                defaultValue="Anuradhapura"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Land Size (Acres)</label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-2 text-sm font-medium">Paddy Types Cultivated</label>
              <div className="flex flex-wrap gap-2">
                {['Samba', 'Keeri Samba', 'Nadu', 'Red Rice'].map((type) => (
                  <span
                    key={type}
                    className="px-4 py-2 bg-[#22C55E]/10 border-2 border-[#22C55E] text-[#22C55E] rounded-lg"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Verification Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <h3 className="font-medium">Land Ownership Verification</h3>
                  <p className="text-sm text-muted-foreground">Verified on March 1, 2026</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm font-medium">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <h3 className="font-medium">Account Verification</h3>
                  <p className="text-sm text-muted-foreground">Account is fully verified</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm font-medium">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Security</h2>
          <button className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-all duration-200">
            Change Password
          </button>
        </div>

        <div className="flex justify-end">
          <button className="px-8 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
