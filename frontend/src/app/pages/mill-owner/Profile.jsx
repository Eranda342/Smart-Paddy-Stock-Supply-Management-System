import { CheckCircle2 } from 'lucide-react';

export default function MillOwnerProfile() {
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your mill account information</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Business Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block mb-2 text-sm font-medium">Business Name</label>
              <input
                type="text"
                defaultValue="Mill Services Ltd"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Registration Number</label>
              <input
                type="text"
                defaultValue="BRN123456"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                disabled
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Mill Location</label>
              <input
                type="text"
                defaultValue="Colombo"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Email Address</label>
              <input
                type="email"
                defaultValue="contact@millservices.lk"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                defaultValue="+94 11 234 5678"
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Verification Status</h2>
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-medium">Business Verification</h3>
                <p className="text-sm text-muted-foreground">Verified on March 1, 2026</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm font-medium">
              Verified
            </span>
          </div>
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
