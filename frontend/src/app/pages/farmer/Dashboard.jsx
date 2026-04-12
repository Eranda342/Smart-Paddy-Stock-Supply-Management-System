import { TrendingUp, TrendingDown, Package, MessageSquare, Receipt, DollarSign, MapPin, Leaf, RefreshCw, FileText, Zap } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { useTheme } from "../../contexts/ThemeContext";
import CountUp from "react-countup";
import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";

export default function FarmerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [step, setStep] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    document.title = "Dashboard | AgroBridge";
    const socket = io("http://localhost:5000");

    socket.on("dashboard_update", () => {
      setRefreshTrigger(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/dashboard/farmer?range=${range}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await res.json();
        if(res.ok) {
          setData(result);
        } else {
          setError(result.message || "Failed to load dashboard");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [range, refreshTrigger]);

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const GREEN = [34, 197, 94];
    const DARK  = [15, 23, 42];
    const GRAY  = [100, 116, 139];
    const LIGHT = [248, 250, 252];
    const now   = new Date();

    const fmt    = (n) => new Intl.NumberFormat("en-LK").format(n || 0);
    const fmtCur = (n) => `Rs. ${fmt(n)}`;

    // â”€â”€ Header Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 38, "F");
    doc.setFillColor(...GREEN);
    doc.rect(0, 35, W, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("AgroBridge", 14, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 220, 150);
    doc.text("Farmer Sales & Activity Report", 14, 24);

    doc.setFontSize(8);
    doc.setTextColor(100, 180, 100);
    doc.text(
      `Generated: ${now.toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}  Â·  ${now.toLocaleTimeString("en-LK")}`,
      14, 31
    );

    // Range badge
    const rangeLabel = range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "All Time";
    doc.setFillColor(...GREEN);
    doc.roundedRect(W - 46, 10, 32, 10, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(rangeLabel, W - 30, 16.5, { align: "center" });

    let y = 48;

    // â”€â”€ Section: Executive Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("Executive Summary", 14, y);
    y += 2;
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.5);
    doc.line(14, y, W - 14, y);
    y += 6;

    const kpis = [
      { label: "Active Listings",       value: fmt(data?.stats?.activeListings) },
      { label: "Ongoing Orders",         value: fmt(data?.stats?.ongoingTransactions) },
      { label: "Completed Sales",        value: fmt(data?.stats?.completedTransactions) },
      { label: "Total Revenue",          value: fmtCur(data?.stats?.monthlyRevenue) },
      { label: "Best Selling Type",      value: data?.bestSelling || "N/A" },
      { label: "Top Market Location",    value: topLocation?.[0] || "N/A" },
    ];

    const colW = (W - 28) / 3;
    const rowH = 20;
    kpis.forEach((kpi, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x   = 14 + col * colW;
      const ky  = y + row * rowH;

      doc.setFillColor(...LIGHT);
      doc.roundedRect(x, ky, colW - 4, rowH - 3, 2, 2, "F");
      doc.setDrawColor(220, 230, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, ky, colW - 4, rowH - 3, 2, 2, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...GRAY);
      doc.text(kpi.label, x + 4, ky + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(String(kpi.value), x + 4, ky + 13.5);
    });
    y += Math.ceil(kpis.length / 3) * rowH + 6;

    // â”€â”€ Section: Monthly Sales Trend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("Monthly Sales Trend", 14, y);
    y += 2;
    doc.setDrawColor(...GREEN);
    doc.line(14, y, W - 14, y);
    y += 4;

    const trendRows = last6Months.map(month => [
      month,
      fmtCur(data?.monthly?.[month] || 0),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Month", "Revenue (Rs.)"]],
      body: trendRows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3.5, textColor: DARK },
      headStyles: { fillColor: GREEN, textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 0: { cellWidth: 40 }, 1: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // â”€â”€ Section: Paddy Distribution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("Paddy Distribution by Type", 14, y);
    y += 2;
    doc.setDrawColor(...GREEN);
    doc.line(14, y, W - 14, y);
    y += 4;

    const distEntries = Object.entries(data?.distribution || {}).sort((a, b) => b[1] - a[1]);
    const totalQty    = distEntries.reduce((s, [, v]) => s + v, 0);
    const distRows    = distEntries.map(([type, qty]) => [
      type,
      `${fmt(qty)} kg`,
      totalQty > 0 ? `${((qty / totalQty) * 100).toFixed(1)}%` : "0%",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Paddy Type", "Quantity Sold (kg)", "Share (%)"]],
      body: distRows.length ? distRows : [["No data", "-", "-"]],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3.5, textColor: DARK },
      headStyles: { fillColor: GREEN, textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;

    if (y > H - 70) { doc.addPage(); y = 20; }

    // â”€â”€ Section: Recent Activity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("Recent Activity", 14, y);
    y += 2;
    doc.setDrawColor(...GREEN);
    doc.line(14, y, W - 14, y);
    y += 4;

    const recentRows = recentActivity.map(r => [
      r.date,
      r.paddyType,
      r.quantity,
      r.status,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Date", "Paddy Type", "Quantity", "Status"]],
      body: recentRows.length ? recentRows : [["No recent activity", "", "", ""]],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3.5, textColor: DARK },
      headStyles: { fillColor: GREEN, textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 2: { halign: "right" }, 3: { halign: "center" } },
      margin: { left: 14, right: 14 },
    });

    // â”€â”€ Footer on every page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFillColor(...DARK);
      doc.rect(0, H - 12, W, 12, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 180, 100);
      doc.text("AgroBridge Â· Smart Paddy Stock Supply Management System Â· Confidential", 14, H - 4.5);
      doc.text(`Page ${p} of ${pageCount}`, W - 14, H - 4.5, { align: "right" });
    }

    doc.save(`AgroBridge_Farmer_Report_${now.toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center text-[#22C55E]">Loading metrics...</div>;
  if (error || !data) return <div className="flex h-[50vh] items-center justify-center text-red-500">{error || "No data"}</div>;

  const generateLast6Months = () => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      result.push(d.toLocaleString("default", { month: "short" }));
    }
    return result;
  };

  const last6Months = generateLast6Months();

  const salesData = data && Object.keys(data.monthly || {}).length > 0 
    ? last6Months.map(month => ({ month, sales: data.monthly[month] || 0 }))
    : [{ month: "No Data", sales: 0 }];

  const paddyDistribution = Object.keys(data.distribution || {}).map((type, i) => {
    const colors = ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6'];
    return {
      id: type,
      name: type,
      value: data.distribution[type],
      color: colors[i % colors.length]
    };
  });

  const recentActivity = (data.recent || []).map((t, idx) => {
    let statusColor = 'text-gray-500 bg-gray-500/10';
    if (t.status === 'COMPLETED' || t.status === 'DELIVERED') statusColor = 'text-green-500 bg-green-500/10';
    else if (t.status === 'DELIVERY_IN_PROGRESS') statusColor = 'text-blue-500 bg-blue-500/10';
    else if (t.status === 'ORDER_CREATED' || t.status === 'PAYMENT_COMPLETED') statusColor = 'text-yellow-500 bg-yellow-500/10';
    
    return {
      id: t._id || idx,
      date: new Date(t.createdAt).toLocaleDateString(),
      paddyType: t.listing?.paddyType || "Paddy",
      quantity: `${t.quantityKg || 0} kg`,
      status: t.status.replace("_", " "),
      statusColor
    };
  });

  const sparkData = last6Months.map(month => ({
    month,
    value: data?.monthly?.[month] || 0
  }));

  const topLocation = Object.entries(data.locations || {}).sort((a, b) => b[1] - a[1])[0];
  return (
    <div id="dashboard-content" className="w-full relative">

      {/* â”€â”€ Ambient background glows (matches Admin) â”€â”€ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />
      </div>

      {/* â”€â”€ Header â”€â”€ */}
      {!user.emailVerified && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 flex items-center justify-between">
          <span>⚠️ Your email is not verified. Please verify to unlock full access.</span>
          <button
            onClick={() => navigate("/verify-email-notice")}
            className="ml-4 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-sm"
          >
            Verify Now
          </button>
        </div>
      )}
      <div className="mb-8 flex flex-wrap sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            Farmer Portal
          </div>
          <h1 className="text-4xl font-bold mb-1.5" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>Welcome back - Here's your farm performance overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Live badge */}
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E', backdropFilter: 'blur(8px)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" style={{ boxShadow: '0 0 6px #22C55E' }} />
            </span>
            Live - Updating
          </div>
          {/* Range pills */}
          <div className="flex items-center p-1 rounded-xl gap-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[['7d','7 Days'],['30d','30 Days'],['all','All Time']].map(([val, label]) => (
              <button key={val} onClick={() => setRange(val)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
                style={range === val ? {
                  background: '#22C55E',
                  color: '#000',
                  boxShadow: '0 0 12px rgba(34,197,94,0.3)',
                } : {
                  color: 'rgba(148,163,184,0.7)',
                }}>
                {label}
              </button>
            ))}
          </div>
          {/* Export */}
          <button onClick={exportPDF}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)', color: '#000', boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(34,197,94,0.45)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(34,197,94,0.25)'}>
            <FileText className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* â”€â”€ KPI Cards â”€â”€ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { icon: Package,      color: '#22C55E', label: 'Active Listings',  value: data?.stats?.activeListings    || 0, growth: 12, prefix: '' },
          { icon: MessageSquare,color: '#3B82F6', label: 'Ongoing Orders',   value: data?.stats?.ongoingTransactions|| 0, growth: 5,  prefix: '' },
          { icon: Receipt,      color: '#A855F7', label: 'Completed Sales',  value: data?.stats?.completedTransactions||0,growth: 18, prefix: '' },
          { icon: DollarSign,   color: '#F59E0B', label: 'Total Revenue',    value: data?.stats?.monthlyRevenue    || 0, growth: data?.stats?.growth||0, prefix: 'Rs ' },
        ].map(({ icon: Icon, color, label, value, growth, prefix }, i) => (
          <div key={i}
            className="relative overflow-hidden rounded-2xl p-6 border cursor-default group transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 0 30px ${color}22, 0 12px 40px rgba(0,0,0,0.3)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Radial glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(ellipse at 10% 10%, ${color}18 0%, transparent 60%)` }} />
            {/* Top glow line */}
            <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)`, border: `1px solid ${color}25` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full`}
                  style={{ background: growth >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: growth >= 0 ? '#22C55E' : '#EF4444' }}>
                  {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(growth).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold mb-1.5 tabular-nums tracking-tight text-white">
              <CountUp end={value} duration={1.5} separator="," prefix={prefix} />
            </div>
            <div className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* â”€â”€ Insight Strip â”€â”€ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Performance insight */}
        <div className="md:col-span-2 rounded-2xl p-5 flex items-center gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Zap className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(148,163,184,0.6)' }}>PERFORMANCE INSIGHT</p>
            <p className="text-sm font-medium text-white">
              {(() => {
                const growth = data?.stats?.growth || 0;
                if (growth > 15) return 'Strong growth! You are scaling fast. Your listings are performing above benchmark.';
                if (growth > 5)  return 'Good progress. Keep the momentum going with more ACTIVE listings.';
                if (growth < 0)  return 'Drop detected. Consider revising your pricing or listing more paddy varieties.';
                return 'Stable performance. Explore new markets to boost your revenue.';
              })()}
            </p>
          </div>
        </div>

        {/* Best Selling + Top Market */}
        <div className="rounded-2xl p-5 flex flex-col justify-center gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <Leaf className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>Best Selling</p>
              <p className="text-sm font-bold text-white">{data.bestSelling || 'N/A'}</p>
            </div>
          </div>
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <MapPin className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>Top Market</p>
              <p className="text-sm font-bold text-white">{topLocation?.[0] || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Charts â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Sales Trend â€” Area chart with gradient */}
        <div className="rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(34,197,94,0.08)]"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Sales Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>Monthly revenue - Last 6 months</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>6M</span>
          </div>
          {salesData[0].month === 'No Data' ? (
            <div className="flex flex-col items-center justify-center h-64 text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
              <Package className="w-8 h-8 mb-3 opacity-30" />
              No data yet â€” start selling to see insights
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="farmerAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#22C55E" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="farmerStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.7)' }} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.7)' }} tickLine={false} axisLine={false} width={72}
                  tickFormatter={v => v >= 1000000 ? `Rs ${(v/1000000).toFixed(1)}M` : v >= 1000 ? `Rs ${(v/1000).toFixed(0)}K` : `Rs ${v}`} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)' }}
                  cursor={{ stroke: 'rgba(34,197,94,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  labelStyle={{ color: 'rgba(148,163,184,0.7)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  itemStyle={{ color: '#22C55E', fontWeight: 700 }} />
                <Area type="monotone" dataKey="sales" name="Revenue"
                  stroke="url(#farmerStrokeGrad)" strokeWidth={2.5}
                  fill="url(#farmerAreaGrad)"
                  dot={false} activeDot={{ r: 6, fill: '#22C55E', strokeWidth: 2, stroke: 'rgba(34,197,94,0.3)' }}
                  isAnimationActive animationDuration={1200} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Paddy Distribution */}
        <div className="rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(59,130,246,0.06)]"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Paddy Distribution</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>Crop mix by quantity sold</p>
            </div>
          </div>
          {paddyDistribution.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
              <Leaf className="w-8 h-8 mb-3 opacity-30" />
              No distribution data yet
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paddyDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={4} dataKey="value" isAnimationActive animationDuration={900}>
                    {paddyDistribution.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', backdropFilter: 'blur(20px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                    labelStyle={{ color: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom legend with progress bars */}
              <div className="w-full lg:w-44 space-y-2.5 shrink-0">
                {paddyDistribution.map(entry => {
                  const total = paddyDistribution.reduce((s, e) => s + e.value, 0);
                  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={entry.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium" style={{ color: entry.color }}>{entry.name}</span>
                        <span style={{ color: 'rgba(148,163,184,0.7)' }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: entry.color, boxShadow: `0 0 6px ${entry.color}80` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Recent Activity â”€â”€ */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>Latest transactions and orders</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Date','Paddy Type','Quantity','Status','Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.6)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12" style={{ color: 'rgba(148,163,184,0.5)' }}>No recent activity</td></tr>
              ) : recentActivity.map((item) => (
                <tr key={item.id}
                  className="transition-colors duration-150"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-4" style={{ color: 'rgba(226,232,240,0.7)' }}>{item.date}</td>
                  <td className="px-5 py-4 font-medium text-white">{item.paddyType}</td>
                  <td className="px-5 py-4" style={{ color: 'rgba(226,232,240,0.7)' }}>{item.quantity}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => navigate(`/farmer/transactions/${item.id}`)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}>
                      View Details
                    </button>
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
