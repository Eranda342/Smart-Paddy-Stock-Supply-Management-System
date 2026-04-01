import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Users, Package, Receipt, Award, MapPin, Truck, Crosshair } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE = 'http://localhost:5000/api/admin/analytics';
const API_TXN = 'http://localhost:5000/api/admin/transactions';
const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ totalUsers: 0, totalTransactions: 0, totalRevenue: 0, totalListings: 0, completedDeliveries: 0 });
  const [conversion, setConversion] = useState({ rate: 0, acceptedNegotiations: 0, transactions: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [paddyData, setPaddyData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [transactionsRaw, setTransactionsRaw] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [oRes, cRes, rRes, uRes, pRes, dRes, tRes] = await Promise.all([
          fetch(`${API_BASE}/overview`, { headers }),
          fetch(`${API_BASE}/conversion`, { headers }),
          fetch(`${API_BASE}/revenue`, { headers }),
          fetch(`${API_BASE}/users`, { headers }),
          fetch(`${API_BASE}/paddy`, { headers }),
          fetch(`${API_BASE}/districts`, { headers }),
          fetch(`${API_TXN}`, { headers })
        ]);

        if (!oRes.ok || !rRes.ok || !uRes.ok || !pRes.ok || !dRes.ok || !cRes.ok || !tRes.ok) throw new Error('Failed to fetch analytics');

        setOverview(await oRes.json());
        setConversion(await cRes.json());
        setRevenueData(await rRes.json());
        setUsersData(await uRes.json());
        setPaddyData(await pRes.json());
        setDistrictData(await dRes.json());
        
        const txnData = await tRes.json();
        setTransactionsRaw(txnData.transactions || []);
      } catch (err) {
        toast.error('Error loading analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const exportExcel = () => {
    if (transactionsRaw.length === 0) return toast.error("No data available to export");
    const data = transactionsRaw.map(t => ({
      Date: new Date(t.createdAt).toLocaleDateString(),
      Buyer: t.millOwner?.fullName || "—",
      Seller: t.farmer?.fullName || "—",
      Amount: `Rs ${t.totalAmount || 0}`,
      Status: t.status || t.paymentStatus || "—"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "AgroBridge_Analytics_Report.xlsx");
    toast.success("Excel downloaded successfully");
  };

  const exportPDF = () => {
    if (transactionsRaw.length === 0) return toast.error("No data available to export");
    const doc = new jsPDF();
    doc.text("AgroBridge Analytics Report", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Total Revenue: Rs ${overview.totalRevenue.toLocaleString()}`, 14, 30);
    doc.text(`Total Transactions: ${overview.totalTransactions.toLocaleString()}`, 14, 37);
    doc.text(`Conversion Rate: ${conversion.rate}%`, 14, 44);

    const tableData = transactionsRaw.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.millOwner?.fullName || "—",
      t.farmer?.fullName || "—",
      `Rs ${t.totalAmount || 0}`,
      t.status || t.paymentStatus || "—"
    ]);

    doc.autoTable({
      startY: 50,
      head: [["Date", "Buyer", "Seller", "Amount", "Status"]],
      body: tableData,
    });

    doc.save("AgroBridge_Analytics_Report.pdf");
    toast.success("PDF downloaded successfully");
  };

  const avgTxnValue = overview.totalTransactions > 0 ? (overview.totalRevenue / overview.totalTransactions) : 0;
  const topPaddy = paddyData.length > 0 ? [...paddyData].sort((a, b) => b.value - a.value)[0].name : '—';
  const topDistrict = districtData.length > 0 ? [...districtData].sort((a, b) => b.value - a.value)[0].name : '—';
  const deliveryRate = overview.totalTransactions > 0 ? ((overview.completedDeliveries / overview.totalTransactions) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-[1320px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Platform insights, growth metrics, and export tools</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors text-sm font-medium">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI CARDS (2 rows of 3 on MD+) */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5">
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="w-9 h-9 bg-emerald-500/10 flex items-center justify-center rounded-xl">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                </div>
              </div>
              <div className="text-2xl font-semibold">Rs {overview.totalRevenue.toLocaleString()}</div>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Transactions</div>
                <div className="w-9 h-9 bg-blue-500/10 flex items-center justify-center rounded-xl">
                  <Receipt className="w-4.5 h-4.5 text-blue-500" />
                </div>
              </div>
              <div className="text-2xl font-semibold">{overview.totalTransactions.toLocaleString()}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Total Users</div>
                <div className="w-9 h-9 bg-purple-500/10 flex items-center justify-center rounded-xl">
                  <Users className="w-4.5 h-4.5 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-semibold">{overview.totalUsers.toLocaleString()}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Total Listings</div>
                <div className="w-9 h-9 bg-amber-500/10 flex items-center justify-center rounded-xl">
                  <Package className="w-4.5 h-4.5 text-amber-500" />
                </div>
              </div>
              <div className="text-2xl font-semibold">{overview.totalListings.toLocaleString()}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
                <div className="w-9 h-9 bg-indigo-500/10 flex items-center justify-center rounded-xl">
                  <Crosshair className="w-4.5 h-4.5 text-indigo-500" />
                </div>
              </div>
              <div className="text-2xl font-semibold">{conversion.rate}%</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Completed Deliveries</div>
                <div className="w-9 h-9 bg-teal-500/10 flex items-center justify-center rounded-xl">
                  <Truck className="w-4.5 h-4.5 text-teal-500" />
                </div>
              </div>
              <div className="text-2xl font-semibold">{overview.completedDeliveries.toLocaleString()}</div>
            </div>
          </div>

          {/* ADVANCED INSIGHTS PANEL */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <Award className="w-6 h-6 text-indigo-500 mb-2" />
              <div className="text-xs text-muted-foreground">Top Paddy</div>
              <div className="text-sm font-semibold mt-1">{topPaddy}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <MapPin className="w-6 h-6 text-rose-500 mb-2" />
              <div className="text-xs text-muted-foreground">Top District</div>
              <div className="text-sm font-semibold mt-1">{topDistrict}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <Receipt className="w-6 h-6 text-emerald-500 mb-2" />
              <div className="text-xs text-muted-foreground">Avg Transaction</div>
              <div className="text-sm font-semibold mt-1">Rs {Math.round(avgTxnValue).toLocaleString()}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
              <div className="text-xs text-muted-foreground">Conversion Rate</div>
              <div className="text-sm font-semibold mt-1">{conversion.rate}%</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <Truck className="w-6 h-6 text-teal-500 mb-2" />
              <div className="text-xs text-muted-foreground">Delivery Success</div>
              <div className="text-sm font-semibold mt-1">{deliveryRate}%</div>
            </div>
          </div>

          {/* CHARTS LAYER 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Line Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Revenue Trend (Last 6 Months)</h2>
              {revenueData.length === 0 ? (
                 <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                      formatter={(val) => `Rs ${val.toLocaleString()}`}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* User Distribution Bar Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">User Growth (Farmers vs Mills)</h2>
              {usersData.length === 0 ? (
                 <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CHARTS LAYER 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paddy Distribution Donut Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Paddy Distribution</h2>
              {paddyData.length === 0 ? (
                 <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paddyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paddyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* District Activity Horizontal Bar Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">District Activity</h2>
              {districtData.length === 0 ? (
                 <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={districtData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
