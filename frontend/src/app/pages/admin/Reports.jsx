import { Download } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const districtData = [
  { district: 'Anuradhapura', volume: 4500 },
  { district: 'Polonnaruwa', volume: 3800 },
  { district: 'Kurunegala', volume: 3200 },
  { district: 'Ratnapura', volume: 2900 },
  { district: 'Colombo', volume: 2400 },
];

const paddyTypeData = [
  { name: 'Samba', value: 38, color: '#22C55E' },
  { name: 'Keeri Samba', value: 25, color: '#3B82F6' },
  { name: 'Nadu', value: 20, color: '#F59E0B' },
  { name: 'Red Rice', value: 12, color: '#8B5CF6' },
  { name: 'White Rice', value: 5, color: '#EC4899' },
];

export default function AdminReports() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Platform insights and data</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Trading Volume</div>
          <div className="text-3xl font-semibold text-[#22C55E]">19,200 kg</div>
          <div className="text-xs text-muted-foreground mt-1">This month</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-2">Active Districts</div>
          <div className="text-3xl font-semibold">18</div>
          <div className="text-xs text-muted-foreground mt-1">Out of 25</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-2">Avg Transaction Value</div>
          <div className="text-3xl font-semibold">Rs 68K</div>
          <div className="text-xs text-muted-foreground mt-1">Per transaction</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-2">Platform Revenue</div>
          <div className="text-3xl font-semibold">Rs 420K</div>
          <div className="text-xs text-muted-foreground mt-1">This month</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Top Districts by Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="district" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="volume" fill="#22C55E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Top Paddy Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paddyTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {paddyTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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

      {/* Recent Reports */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Generated Reports</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { name: 'Monthly Trading Report - February 2026', date: '2026-03-01', size: '2.4 MB' },
            { name: 'User Growth Analysis - Q1 2026', date: '2026-02-28', size: '1.8 MB' },
            { name: 'District Performance Report - January 2026', date: '2026-02-01', size: '3.1 MB' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium mb-1">{report.name}</h3>
                <p className="text-sm text-muted-foreground">Generated on {report.date} • {report.size}</p>
              </div>
              <button className="p-2 hover:bg-card rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
