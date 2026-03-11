import { TrendingUp, TrendingDown, Package, MessageSquare, Receipt, DollarSign } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const salesData = [
  { id: 'jan', month: 'Jan', sales: 45000 },
  { id: 'feb', month: 'Feb', sales: 52000 },
  { id: 'mar', month: 'Mar', sales: 48000 },
  { id: 'apr', month: 'Apr', sales: 61000 },
  { id: 'may', month: 'May', sales: 55000 },
  { id: 'jun', month: 'Jun', sales: 67000 },
];

const paddyDistribution = [
  { id: 'samba', name: 'Samba', value: 35, color: '#22C55E' },
  { id: 'keeri', name: 'Keeri Samba', value: 28, color: '#3B82F6' },
  { id: 'nadu', name: 'Nadu', value: 22, color: '#F59E0B' },
  { id: 'red', name: 'Red Rice', value: 15, color: '#8B5CF6' },
];

const recentActivity = [
  { id: 1, date: '2026-03-02', paddyType: 'Samba', quantity: '500 kg', status: 'Completed', statusColor: 'text-green-500 bg-green-500/10' },
  { id: 2, date: '2026-03-01', paddyType: 'Keeri Samba', quantity: '750 kg', status: 'In Transit', statusColor: 'text-blue-500 bg-blue-500/10' },
  { id: 3, date: '2026-02-28', paddyType: 'Nadu', quantity: '600 kg', status: 'Pending', statusColor: 'text-yellow-500 bg-yellow-500/10' },
  { id: 4, date: '2026-02-27', paddyType: 'Red Rice', quantity: '450 kg', status: 'Completed', statusColor: 'text-green-500 bg-green-500/10' },
];

export default function FarmerDashboard() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here's your farming overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-[#22C55E]" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">8</div>
          <div className="text-sm text-muted-foreground">Active Listings</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+5%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">12</div>
          <div className="text-sm text-muted-foreground">Ongoing Negotiations</div>
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
          <div className="text-3xl font-semibold mb-1">24</div>
          <div className="text-sm text-muted-foreground">Completed Transactions</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-red-500">
              <TrendingDown className="w-4 h-4" />
              <span>-3%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">Rs 328K</div>
          <div className="text-sm text-muted-foreground">Monthly Revenue</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
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
              <Line type="monotone" dataKey="sales" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Paddy Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paddyDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {paddyDistribution.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Paddy Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4">{item.date}</td>
                  <td className="p-4">{item.paddyType}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-[#22C55E] hover:underline text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
