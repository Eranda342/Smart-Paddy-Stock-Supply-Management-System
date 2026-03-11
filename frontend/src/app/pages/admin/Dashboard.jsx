import { TrendingUp, Users, ShieldCheck, Package, Receipt } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tradingVolumeData = [
  { month: 'Jan', volume: 12500 },
  { month: 'Feb', volume: 15200 },
  { month: 'Mar', volume: 14800 },
  { month: 'Apr', volume: 17100 },
  { month: 'May', volume: 16500 },
  { month: 'Jun', volume: 19200 },
];

const userGrowthData = [
  { month: 'Jan', farmers: 45, mills: 12 },
  { month: 'Feb', farmers: 52, mills: 18 },
  { month: 'Mar', farmers: 68, mills: 24 },
  { month: 'Apr', farmers: 84, mills: 28 },
  { month: 'May', farmers: 105, mills: 35 },
  { month: 'Jun', farmers: 132, mills: 42 },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#22C55E]" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+15%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">177</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-orange-500">
              <span>8 Pending</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">8</div>
          <div className="text-sm text-muted-foreground">Pending Approvals</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+22%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">143</div>
          <div className="text-sm text-muted-foreground">Active Listings</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+18%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">284</div>
          <div className="text-sm text-muted-foreground">Total Transactions</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Monthly Trading Volume (kg)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tradingVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="volume" stroke="#22C55E" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="farmers" fill="#22C55E" radius={[8, 8, 0, 0]} />
              <Bar dataKey="mills" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
