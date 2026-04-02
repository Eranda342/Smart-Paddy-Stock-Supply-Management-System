import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Users, Package, Receipt, Award, MapPin, Truck, Crosshair } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  // ─── Derived values used by both exports ───────────────────────────────────
  const avgTxnValueCalc = overview.totalTransactions > 0
    ? Math.round(overview.totalRevenue / overview.totalTransactions)
    : 0;
  const deliveryRateCalc = overview.totalTransactions > 0
    ? ((overview.completedDeliveries / overview.totalTransactions) * 100).toFixed(1)
    : '0.0';
  const topPaddyCalc   = paddyData.length  > 0 ? [...paddyData].sort((a,b)=>b.value-a.value)[0].name : '—';
  const topDistrictCalc = districtData.length > 0 ? [...districtData].sort((a,b)=>b.value-a.value)[0].name : '—';
  const generatedAt = new Date().toLocaleString('en-LK', { dateStyle: 'long', timeStyle: 'short' });

  // ─── Export Excel (multi-sheet) ─────────────────────────────────────────────
  const exportExcel = () => {
    if (transactionsRaw.length === 0) return toast.error('No transaction data available to export');

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Platform Summary ──────────────────────────────────────────
    const summaryRows = [
      ['AgroBridge – Platform Analytics Report'],
      [`Generated: ${generatedAt}`],
      [],
      ['PLATFORM OVERVIEW'],
      ['Metric', 'Value'],
      ['Total Revenue (Rs)', overview.totalRevenue],
      ['Total Transactions', overview.totalTransactions],
      ['Total Users', overview.totalUsers],
      ['Total Listings', overview.totalListings],
      ['Conversion Rate (%)', conversion.rate],
      ['Completed Deliveries', overview.completedDeliveries],
      ['Accepted Negotiations', conversion.acceptedNegotiations],
      ['Avg Transaction Value (Rs)', avgTxnValueCalc],
      ['Delivery Success Rate (%)', deliveryRateCalc],
      ['Top Paddy Variety', topPaddyCalc],
      ['Top District', topDistrictCalc],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 32 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Platform Summary');

    // ── Sheet 2: Transactions ──────────────────────────────────────────────
    const txnData = transactionsRaw.map((t, i) => ({
      '#':               i + 1,
      'Order Number':    t.orderNumber || '—',
      'Date':            new Date(t.createdAt).toLocaleDateString('en-LK'),
      'Paddy Type':      t.listing?.paddyType || '—',
      'Buyer (Mill)':    t.millOwner?.fullName || '—',
      'Seller (Farmer)': t.farmer?.fullName || '—',
      'Qty (kg)':        t.quantityKg || 0,
      'Price/kg (Rs)':   t.finalPricePerKg || 0,
      'Total (Rs)':      t.totalAmount || 0,
      'Platform Fee (Rs)': t.platformFee || 0,
      'Payment':         t.paymentStatus || '—',
      'Order Status':    t.status || '—',
      'Transport':       t.transportStatus || '—',
      'Pickup Confirmed':  t.pickupConfirmed ? 'Yes' : 'No',
      'Delivery Confirmed': t.deliveryConfirmed ? 'Yes' : 'No',
    }));
    const wsTxn = XLSX.utils.json_to_sheet(txnData);
    wsTxn['!cols'] = [
      {wch:4},{wch:14},{wch:12},{wch:14},{wch:22},{wch:22},
      {wch:10},{wch:14},{wch:14},{wch:16},{wch:10},{wch:18},{wch:14},{wch:17},{wch:19}
    ];
    XLSX.utils.book_append_sheet(wb, wsTxn, 'Transactions');

    // ── Sheet 3: Revenue Trend ─────────────────────────────────────────────
    if (revenueData.length > 0) {
      const wsRev = XLSX.utils.json_to_sheet(
        revenueData.map(r => ({ Month: r.month, 'Revenue (Rs)': r.revenue }))
      );
      wsRev['!cols'] = [{ wch: 10 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, wsRev, 'Revenue Trend');
    }

    // ── Sheet 4: Paddy Distribution ────────────────────────────────────────
    if (paddyData.length > 0) {
      const total = paddyData.reduce((s, d) => s + d.value, 0);
      const wsPaddy = XLSX.utils.json_to_sheet(
        [...paddyData].sort((a,b)=>b.value-a.value).map(d => ({
          'Paddy Type': d.name,
          'Listings': d.value,
          'Share (%)': ((d.value / total) * 100).toFixed(1)
        }))
      );
      wsPaddy['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsPaddy, 'Paddy Distribution');
    }

    // ── Sheet 5: District Activity ─────────────────────────────────────────
    if (districtData.length > 0) {
      const wsDistrict = XLSX.utils.json_to_sheet(
        [...districtData].sort((a,b)=>b.value-a.value).map(d => ({
          District: d.name,
          Listings: d.value
        }))
      );
      wsDistrict['!cols'] = [{ wch: 18 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsDistrict, 'District Activity');
    }

    // ── Sheet 6: User Distribution ─────────────────────────────────────────
    if (usersData.length > 0) {
      const wsUsers = XLSX.utils.json_to_sheet(
        usersData.map(u => ({ 'Role': u.name, 'Count': u.value }))
      );
      wsUsers['!cols'] = [{ wch: 16 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsUsers, 'User Distribution');
    }

    XLSX.writeFile(wb, `AgroBridge_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success('Excel report downloaded!');
  };

  // ─── Export PDF ──────────────────────────────────────────────────────────────
  const exportPDF = () => {
    if (transactionsRaw.length === 0) return toast.error('No transaction data available to export');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const GREEN  = [34, 197, 94];
    const DARK   = [15, 23, 42];
    const GRAY   = [100, 116, 139];
    const WHITE  = [255, 255, 255];
    const LIGHT  = [241, 245, 249];

    const addHeader = (title, subtitle) => {
      // Green header bar
      doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.rect(0, 0, pageW, 22, 'F');
      // Logo text
      doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AgroBridge', 10, 14);
      // Page title (right)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(title, pageW - 10, 14, { align: 'right' });
      // Subtitle strip
      doc.setFillColor(DARK[0], DARK[1], DARK[2]);
      doc.rect(0, 22, pageW, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.text(subtitle || `Generated: ${generatedAt}`, 10, 27.5);
      doc.text('ADMIN PORTAL  |  CONFIDENTIAL', pageW - 10, 27.5, { align: 'right' });
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    };

    const addFooter = (pageNum, total) => {
      doc.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
      doc.rect(0, pageH - 10, pageW, 10, 'F');
      doc.setFontSize(7);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.text(`AgroBridge Analytics Report  •  ${generatedAt}`, 10, pageH - 3.5);
      doc.text(`Page ${pageNum} of ${total}`, pageW - 10, pageH - 3.5, { align: 'right' });
    };

    try {
      // ───────────────────────────────────────────────────────────────────────
      // PAGE 1 — Executive Summary
      // ───────────────────────────────────────────────────────────────────────
      addHeader('Analytics Report', `Platform snapshot as of ${generatedAt}`);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text('Executive Summary', 10, 40);

      // KPI grid (2 rows × 4 cols) — use rect() not roundedRect() for jsPDF v2
      const kpis = [
        { label: 'Total Revenue',        value: `Rs ${overview.totalRevenue.toLocaleString()}`, color: GREEN },
        { label: 'Total Transactions',   value: overview.totalTransactions.toLocaleString(),     color: [59,130,246] },
        { label: 'Total Users',          value: overview.totalUsers.toLocaleString(),            color: [139,92,246] },
        { label: 'Total Listings',       value: overview.totalListings.toLocaleString(),         color: [245,158,11] },
        { label: 'Conversion Rate',      value: `${conversion.rate}%`,                          color: [99,102,241] },
        { label: 'Completed Deliveries', value: overview.completedDeliveries.toLocaleString(),  color: [20,184,166] },
        { label: 'Avg Transaction',      value: `Rs ${avgTxnValueCalc.toLocaleString()}`,       color: [236,72,153] },
        { label: 'Delivery Success',     value: `${deliveryRateCalc}%`,                         color: [239,68,68] },
      ];

      const colW   = (pageW - 20) / 4;
      const rowH   = 22;
      const startY = 45;

      kpis.forEach((kpi, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 10 + col * colW;
        const y = startY + row * (rowH + 4);

        // Card background
        doc.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
        doc.rect(x, y, colW - 2, rowH, 'F');
        // Color accent bar (left edge)
        doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.rect(x, y, 3, rowH, 'F');
        // Label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text(kpi.label, x + 7, y + 7);
        // Value
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(DARK[0], DARK[1], DARK[2]);
        doc.text(kpi.value, x + 7, y + 16);
      });

      // Key Insights table
      const insightY = startY + 2 * (rowH + 4) + 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text('Key Insights', 10, insightY);

      const insightsTable = autoTable(doc, {
        startY: insightY + 4,
        head: [['Metric', 'Value']],
        body: [
          ['Top Paddy Variety',     topPaddyCalc],
          ['Top District',          topDistrictCalc],
          ['Accepted Negotiations', String(conversion.acceptedNegotiations || 0)],
          ['Avg Transaction Value', `Rs ${avgTxnValueCalc.toLocaleString()}`],
          ['Delivery Success Rate', `${deliveryRateCalc}%`],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70 }, 1: { cellWidth: 80 } },
        margin: { left: 10, right: 10 },
      });

      // Revenue Trend mini-table
      if (revenueData.length > 0) {
        const ry = (insightsTable?.finalY ?? doc.lastAutoTable?.finalY ?? insightY + 40) + 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(DARK[0], DARK[1], DARK[2]);
        doc.text('Revenue Trend (Last 6 Months)', 10, ry);
        autoTable(doc, {
          startY: ry + 4,
          head: [revenueData.map(r => r.month)],
          body:  [revenueData.map(r => `Rs ${r.revenue.toLocaleString()}`)],
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 3, halign: 'center' },
          headStyles: { fillColor: DARK, textColor: WHITE, fontSize: 8 },
          margin: { left: 10, right: 10 },
        });
      }

      addFooter(1, 2);

      // ─── PAGE 2 — Transaction Register ──────────────────────────────────────
      doc.addPage();
      addHeader('Transaction Register');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text(`All Transactions  (${transactionsRaw.length} records)`, 10, 40);

      const txRows = transactionsRaw.map((t, i) => [
        i + 1,
        t.orderNumber || '—',
        new Date(t.createdAt).toLocaleDateString(),
        t.listing?.paddyType || '—',
        t.millOwner?.fullName || '—',
        t.farmer?.fullName || '—',
        `${t.quantityKg || 0} kg`,
        `Rs ${(t.finalPricePerKg || 0).toLocaleString()}`,
        `Rs ${(t.totalAmount || 0).toLocaleString()}`,
        t.paymentStatus || '—',
        (t.status || '—').replace(/_/g, ' '),
      ]);

      autoTable(doc, {
        startY: 44,
        head: [['#', 'Order No.', 'Date', 'Paddy', 'Buyer (Mill)', 'Seller (Farmer)', 'Qty', 'Price/kg', 'Total', 'Payment', 'Status']],
        body: txRows,
        theme: 'striped',
        styles: { fontSize: 7, cellPadding: 2.5 },
        headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0:  { cellWidth: 8,  halign: 'center' },
          1:  { cellWidth: 22 },
          2:  { cellWidth: 20 },
          3:  { cellWidth: 18 },
          4:  { cellWidth: 32 },
          5:  { cellWidth: 32 },
          6:  { cellWidth: 14, halign: 'right' },
          7:  { cellWidth: 20, halign: 'right' },
          8:  { cellWidth: 22, halign: 'right' },
          9:  { cellWidth: 16, halign: 'center' },
          10: { cellWidth: 22, halign: 'center' },
        },
        margin: { left: 10, right: 10 },
      });

      addFooter(2, 2);

      doc.save(`AgroBridge_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('PDF report downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error(`PDF export failed: ${err.message}`);
    }
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
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} tickFormatter={(v) => Math.floor(v)} />
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
              ) : (() => {
                const total = paddyData.reduce((s, d) => s + d.value, 0);
                return (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Donut — no inline labels */}
                    <div className="shrink-0">
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <Pie
                            data={paddyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {paddyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                            formatter={(val, name) => [`${val} listings (${((val / total) * 100).toFixed(1)}%)`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend list */}
                    <div className="flex-1 w-full space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
                      {[...paddyData].sort((a, b) => b.value - a.value).map((entry, index) => {
                        const pct = ((entry.value / total) * 100).toFixed(1);
                        const color = COLORS[paddyData.indexOf(entry) % COLORS.length];
                        return (
                          <div key={entry.name}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="text-sm text-foreground truncate">{entry.name}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                <span className="text-sm font-semibold">{entry.value}</span>
                                <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
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
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} tickFormatter={(v) => Math.floor(v)} />
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
