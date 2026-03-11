import { TrendingUp, ShoppingCart, MessageSquare, Package, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const procurementData = [
  { id: 'samba', type: 'Samba', amount: 2500 },
  { id: 'keeri', type: 'Keeri Samba', amount: 1800 },
  { id: 'nadu', type: 'Nadu', amount: 1500 },
  { id: 'red', type: 'Red Rice', amount: 1200 },
  { id: 'white', type: 'White Rice', amount: 900 },
];

const recentPurchases = [
  { id: 1, farmer: 'John Doe', paddyType: 'Samba', quantity: '500 kg', price: 'Rs 42,500', date: '2026-03-02', status: 'Completed', statusColor: 'text-green-500 bg-green-500/10' },
  { id: 2, farmer: 'Kamal Silva', paddyType: 'Keeri Samba', quantity: '750 kg', price: 'Rs 71,250', date: '2026-03-01', status: 'In Transit', statusColor: 'text-blue-500 bg-blue-500/10' },
  { id: 3, farmer: 'Nimal Fernando', paddyType: 'Nadu', quantity: '600 kg', price: 'Rs 45,000', date: '2026-02-28', status: 'Pending', statusColor: 'text-yellow-500 bg-yellow-500/10' },
];

export default function MillOwnerDashboard() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your procurement activities</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#22C55E]" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+8%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">15</div>
          <div className="text-sm text-muted-foreground">Active Purchases</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">9</div>
          <div className="text-sm text-muted-foreground">Ongoing Negotiations</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+15%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">7,850 kg</div>
          <div className="text-sm text-muted-foreground">Monthly Procurement</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+10%</span>
            </div>
          </div>
          <div className="text-3xl font-semibold mb-1">Rs 658K</div>
          <div className="text-sm text-muted-foreground">Total Spend</div>
        </div>
      </div>

      {/* Procurement Chart */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6">Procurement by Paddy Type</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={procurementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="type" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--color-card)', 
                border: '1px solid var(--color-border)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="amount" fill="#22C55E" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Purchases Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Recent Purchases</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Date</th>
                <th className="text-left p-4 text-sm font-medium">Farmer</th>
                <th className="text-left p-4 text-sm font-medium">Paddy Type</th>
                <th className="text-left p-4 text-sm font-medium">Quantity</th>
                <th className="text-left p-4 text-sm font-medium">Price</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                  <td className="p-4">{purchase.date}</td>
                  <td className="p-4">{purchase.farmer}</td>
                  <td className="p-4">{purchase.paddyType}</td>
                  <td className="p-4">{purchase.quantity}</td>
                  <td className="p-4">{purchase.price}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${purchase.statusColor}`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-[#22C55E] hover:underline text-sm">View</button>
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
