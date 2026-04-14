import { useState, useEffect, useCallback } from 'react';
import { Settings, Save, ToggleLeft, ToggleRight, Info, Shield, Sliders, DollarSign, Clock, LayoutDashboard, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';

const API_BASE = 'http://localhost:5000/api/admin/settings';

const ToggleSwitch = ({ value, onChange, label, description }) => (
  <div className="flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors px-4 rounded-lg -mx-4">
    <div className="pr-8">
      <p className="text-sm font-semibold">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${value ? 'bg-[#22C55E]' : 'bg-muted-foreground/30'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformFeePercentage: 5,
    autoDisputeDays: 3,
    maintenanceMode: false,
    maxListingsPerUser: 20,
    supportEmail: 'support@agrobridge.lk'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('parameters');

  const fetchSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_BASE, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data) setSettings(data);
    } catch {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (customPayload = null) => {
    setSaving(true);
    try {
      const finalPayload = (customPayload && !customPayload.nativeEvent) ? customPayload : settings;
      const token = localStorage.getItem('token');
      const res = await fetch(API_BASE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(finalPayload)
      });
      if (!res.ok) throw new Error();
      
      const data = await res.json();
      setSettings(data.settings);
      toast.success('System parameters secured globally!');
    } catch {
      toast.error('Failed to sync settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'parameters', label: 'Global Parameters', icon: Sliders },
    { id: 'financials', label: 'Financial Controls', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance & Safety', icon: Shield },
  ];

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">System Settings</h1>
          <p className="text-muted-foreground">Configure live platform parameters and automation thresholds</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={saving || loading}
          className="shadow-sm shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Synchronizing Pipeline...' : 'Deploy Changes'}
        </Button>
      </div>

      <div className="flex items-start gap-4 p-4 bg-muted/40 border border-border rounded-xl">
        <Database className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Live Database Binding Active</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-3xl">These settings are hooked directly into the backend Cron jobs and calculation parameters. Adjusting ranges here will instantly impact automatic routing, platform commissions, and maintenance modes across the entire public network.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit border border-border/50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-primary shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center border border-border bg-card rounded-2xl">
           <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative">
          {/* Global Parameters */}
          {activeTab === 'parameters' && (
            <div className="group relative bg-card/60 backdrop-blur-2xl border border-border/50 hover:border-primary/20 rounded-3xl p-6 lg:p-8 space-y-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex gap-4 items-center mb-2 relative z-10">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">System Defaults</h3>
                  <p className="text-sm text-muted-foreground">Adjust absolute values capping user activity grids</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="group/input flex flex-col justify-between h-full bg-muted/10 p-5 rounded-2xl border border-transparent hover:border-border/60 transition-colors">
                  <label className="text-sm font-semibold mb-2 block">Maximum Listings Per Farmer</label>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Limits the absolute number of active Paddy listings a verified farmer can possess concurrently.</p>
                  <input
                    type="number"
                    min="1"
                    value={settings.maxListingsPerUser}
                    onChange={e => handleChange('maxListingsPerUser', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-3 bg-background hover:bg-muted/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 shadow-inner hover:shadow-md font-medium"
                  />
                </div>
                <div className="group/input flex flex-col justify-between h-full bg-muted/10 p-5 rounded-2xl border border-transparent hover:border-border/60 transition-colors">
                  <label className="text-sm font-semibold mb-2 block">Global Support Routing Email</label>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">The active mailbox handling escalated administrative disputes dispatched from users.</p>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={e => handleChange('supportEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-background hover:bg-muted/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 shadow-inner hover:shadow-md font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financial Controls */}
          {activeTab === 'financials' && (
            <div className="group relative bg-card/60 backdrop-blur-2xl border border-border/50 hover:border-green-500/20 rounded-3xl p-6 lg:p-8 space-y-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex gap-4 items-center mb-2 relative z-10">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Fiscal & Automation Controls</h3>
                  <p className="text-sm text-muted-foreground">Regulate taxation algorithms and automatic pipeline triggers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="group/slider flex flex-col justify-between h-full bg-muted/10 p-5 rounded-2xl border border-transparent hover:border-border/60 transition-colors">
                  <label className="text-sm font-semibold mb-2 flex justify-between">
                    Platform Commission Rate 
                    <span className="text-primary font-bold">{settings.platformFeePercentage}%</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">The percentage tax cut AgroBridge takes natively off entirely completed cross-platform transactions. Do not change drastically without user notice.</p>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={settings.platformFeePercentage}
                    onChange={e => handleChange('platformFeePercentage', Number(e.target.value))}
                    onMouseUp={() => handleSave({ ...settings })}
                    onTouchEnd={() => handleSave({ ...settings })}
                    style={{ 
                      backgroundImage: `linear-gradient(currentColor, currentColor)`,
                      backgroundSize: `${(settings.platformFeePercentage / 50) * 100}% 100%`,
                      backgroundRepeat: 'no-repeat'
                    }}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer text-primary accent-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all hover:scale-[1.01]"
                  />
                </div>
                <div className="group/slider flex flex-col justify-between h-full bg-muted/10 p-5 rounded-2xl border border-transparent hover:border-border/60 transition-colors">
                  <label className="text-sm font-semibold mb-2 flex justify-between">
                    Auto-Dispute Trigger Threshold
                    <span className="text-amber-500 font-bold">{settings.autoDisputeDays} Days</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">The internal Cron job scans for pending deliveries. Determine the margin of delay logic needed to trigger an automatic tracking report via the dispute system.</p>
                  <input
                     type="range"
                     min="1"
                     max="14"
                     value={settings.autoDisputeDays}
                     onChange={e => handleChange('autoDisputeDays', Number(e.target.value))}
                     onMouseUp={() => handleSave({ ...settings })}
                     onTouchEnd={() => handleSave({ ...settings })}
                     style={{ 
                       backgroundImage: `linear-gradient(#f59e0b, #f59e0b)`,
                       backgroundSize: `${((settings.autoDisputeDays - 1) / 13) * 100}% 100%`,
                       backgroundRepeat: 'no-repeat'
                     }}
                     className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all hover:scale-[1.01]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Maintenance & Safety */}
          {activeTab === 'maintenance' && (
            <div className={`bg-card border ${settings.maintenanceMode ? 'border-red-400/50' : 'border-border'} rounded-2xl p-6 lg:p-8 shadow-sm transition-colors`}>
              <div className="flex gap-4 items-center mb-6">
                <div className={`w-10 h-10 ${settings.maintenanceMode ? 'bg-red-500/10' : 'bg-rose-500/10'} rounded-xl flex items-center justify-center shrink-0 transition-colors`}>
                  <Shield className={`w-5 h-5 ${settings.maintenanceMode ? 'text-red-500' : 'text-rose-500'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Access Restriction Engine</h3>
                  <p className="text-sm text-muted-foreground">Manage user routing overrides for safe pipeline deployments</p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border transition-colors ${settings.maintenanceMode ? 'bg-red-500/5 border-red-500/30' : 'bg-muted/30 border-border/50'}`}>
                <ToggleSwitch
                  value={settings.maintenanceMode}
                  onChange={v => {
                    const newSettings = { ...settings, maintenanceMode: v };
                    setSettings(newSettings);
                    handleSave(newSettings);
                  }}
                  label="Global Maintenance Mode Override"
                  description="⚠️ EMERGENCY ONLY: Throwing this switch will immediately intercept active connections across the entire system. All non-admin requests will hit a hardcoded 503 Maintenance landing block. Data states will freeze until un-toggled."
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
