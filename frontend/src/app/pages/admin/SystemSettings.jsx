import { useState } from 'react';
import { Settings, Save, ToggleLeft, ToggleRight, Info, Shield, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

const SETTINGS_KEY = 'admin_platform_settings';

const defaultSettings = {
  platform: {
    platformName: 'AgroBridge',
    supportEmail: 'support@agrobridge.com',
    defaultCurrency: 'LKR',
    maxListingQuantity: 50000,
    minListingPrice: 10,
  },
  features: {
    enableNegotiations: true,
    enableTransport: true,
    enableNotifications: true,
    maintenanceMode: false,
    requireVerification: true,
    autoApproveListings: false,
  },
  limits: {
    maxActiveListingsPerFarmer: 10,
    negotiationTimeoutDays: 7,
    transactionCompletionDays: 30,
    maxVehiclesPerMillOwner: 20,
  }
};

const ToggleSwitch = ({ value, onChange, label, description }) => (
  <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${value ? 'bg-[#22C55E]' : 'bg-muted'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

export default function AdminSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('platform');

  const updateFeature = (key, value) => {
    setSettings(prev => ({ ...prev, features: { ...prev.features, [key]: value } }));
  };

  const updatePlatform = (key, value) => {
    setSettings(prev => ({ ...prev, platform: { ...prev.platform, [key]: value } }));
  };

  const updateLimit = (key, value) => {
    setSettings(prev => ({ ...prev, limits: { ...prev.limits, [key]: value } }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSaving(false);
      toast.success('Settings saved successfully!');
    }, 700);
  };

  const tabs = [
    { id: 'platform', label: 'Platform', icon: Shield },
    { id: 'features', label: 'Features', icon: ToggleRight },
    { id: 'limits', label: 'Limits', icon: Sliders },
  ];

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">System Settings</h1>
          <p className="text-muted-foreground">Configure platform behavior and defaults</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] font-medium rounded-xl transition-colors text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-400">Settings are saved locally for now</p>
          <p className="text-xs text-blue-400/70 mt-0.5">In production, wire these to a backend config API for persistence across server restarts.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Platform Settings */}
      {activeTab === 'platform' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-base mb-4">Platform Configuration</h3>
          {[
            { key: 'platformName', label: 'Platform Name', type: 'text' },
            { key: 'supportEmail', label: 'Support Email', type: 'email' },
            { key: 'defaultCurrency', label: 'Default Currency', type: 'text' },
            { key: 'maxListingQuantity', label: 'Max Listing Quantity (kg)', type: 'number' },
            { key: 'minListingPrice', label: 'Min Listing Price (Rs/kg)', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
              <input
                type={field.type}
                value={settings.platform[field.key]}
                onChange={e => updatePlatform(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all"
              />
            </div>
          ))}
        </div>
      )}

      {/* Feature Toggles */}
      {activeTab === 'features' && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-base mb-2">Feature Toggles</h3>
          <p className="text-sm text-muted-foreground mb-5">Enable or disable platform features globally</p>
          <ToggleSwitch
            value={settings.features.enableNegotiations}
            onChange={v => updateFeature('enableNegotiations', v)}
            label="Enable Negotiations"
            description="Allow farmers and mill owners to negotiate on listings"
          />
          <ToggleSwitch
            value={settings.features.enableTransport}
            onChange={v => updateFeature('enableTransport', v)}
            label="Enable Transport Module"
            description="Allow mill owners to assign vehicles for delivery"
          />
          <ToggleSwitch
            value={settings.features.enableNotifications}
            onChange={v => updateFeature('enableNotifications', v)}
            label="Enable Notifications"
            description="Send real-time notifications to users via WebSocket"
          />
          <ToggleSwitch
            value={settings.features.requireVerification}
            onChange={v => updateFeature('requireVerification', v)}
            label="Require User Verification"
            description="Users must be verified by admin before listing or buying"
          />
          <ToggleSwitch
            value={settings.features.autoApproveListings}
            onChange={v => updateFeature('autoApproveListings', v)}
            label="Auto-Approve Listings"
            description="Automatically approve new listings without admin review"
          />
          <ToggleSwitch
            value={settings.features.maintenanceMode}
            onChange={v => updateFeature('maintenanceMode', v)}
            label="Maintenance Mode"
            description="⚠️ When enabled, the platform will be down for all non-admin users"
          />
        </div>
      )}

      {/* Limits */}
      {activeTab === 'limits' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-base mb-4">Platform Limits</h3>
          {[
            { key: 'maxActiveListingsPerFarmer', label: 'Max Active Listings per Farmer', unit: 'listings' },
            { key: 'negotiationTimeoutDays', label: 'Negotiation Timeout', unit: 'days' },
            { key: 'transactionCompletionDays', label: 'Transaction Completion Deadline', unit: 'days' },
            { key: 'maxVehiclesPerMillOwner', label: 'Max Vehicles per Mill Owner', unit: 'vehicles' },
          ].map(field => (
            <div key={field.key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium block">{field.label}</label>
                <span className="text-xs text-muted-foreground">Unit: {field.unit}</span>
              </div>
              <input
                type="number"
                value={settings.limits[field.key]}
                onChange={e => updateLimit(field.key, Number(e.target.value))}
                className="w-28 text-right px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
