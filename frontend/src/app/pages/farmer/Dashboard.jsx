import { TrendingUp, TrendingDown, Package, MessageSquare, Receipt, DollarSign } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
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

    // ── Header Banner ─────────────────────────────────────────
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
      `Generated: ${now.toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}  ·  ${now.toLocaleTimeString("en-LK")}`,
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

    // ── Section: Executive Summary ────────────────────────────
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

    // ── Section: Monthly Sales Trend ──────────────────────────
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

    // ── Section: Paddy Distribution ───────────────────────────
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

    // ── Section: Recent Activity ──────────────────────────────
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

    // ── Footer on every page ───────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFillColor(...DARK);
      doc.rect(0, H - 12, W, 12, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 180, 100);
      doc.text("AgroBridge · Smart Paddy Stock Supply Management System · Confidential", 14, H - 4.5);
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
    <div id="dashboard-content" className="w-full animate-fadeIn transition-all duration-300 ease-out">
      <div className="mb-8 flex flex-wrap sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, here's your farming overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-4 py-2 text-sm font-medium rounded-xl border border-border bg-card/60 backdrop-blur-md text-foreground hover:bg-accent hover:scale-[1.02] shadow-sm transition-all flex items-center gap-2">
            {theme === "dark" ? "Light Mode ☀️" : "Dark Mode 🌙"}
          </button>
          <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
            <button onClick={() => setRange("7d")} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${range === "7d" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>7 Days</button>
            <button onClick={() => setRange("30d")} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${range === "30d" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>30 Days</button>
            <button onClick={() => setRange("all")} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${range === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>All Time</button>
          </div>
          <button onClick={exportPDF} className="relative overflow-hidden px-5 py-2 text-sm font-medium rounded-xl bg-green-500 hover:bg-green-400 text-black shadow-md shadow-green-500/20 hover:shadow-green-500/40 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2">
            Export Report 📄
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative">
        {step === 0 && <div className="absolute -top-6 left-2 font-medium text-green-500 animate-pulse text-sm flex items-center gap-2"><span>📊</span> Your performance overview</div>}
        <div className={`bg-card/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_10px_rgba(34,197,94,0.05)] hover:shadow-[0_0_15px_rgba(34,197,94,0.08)] hover:dark:shadow-[0_0_15px_rgba(34,197,94,0.08)] rounded-2xl p-4 md:p-6 hover:scale-[1.03] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${step === 0 ? "ring-2 ring-green-400 scale-[1.02]" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10 w-full">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-[#22C55E] group-hover:rotate-6 transition-transform" />
            </div>
            <div className="h-10 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="value" stroke="#4ade80" opacity={0.7} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-semibold mb-1"><CountUp end={data?.stats?.activeListings || 0} duration={1.5} separator="," /></div>
            <div className="text-sm text-muted-foreground w-full flex items-center justify-between">
              <span>Active Listings</span>
              <span className="text-green-500 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 12%</span>
            </div>
          </div>
        </div>

        <div className={`bg-card/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_10px_rgba(59,130,246,0.05)] hover:shadow-[0_0_15px_rgba(59,130,246,0.08)] hover:dark:shadow-[0_0_15px_rgba(59,130,246,0.08)] rounded-2xl p-4 md:p-6 hover:scale-[1.03] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${step === 0 ? "ring-2 ring-blue-400 scale-[1.02]" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10 w-full">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-blue-500 group-hover:rotate-6 transition-transform" />
            </div>
            <div className="h-10 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="value" stroke="#60a5fa" opacity={0.7} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-semibold mb-1"><CountUp end={data?.stats?.ongoingTransactions || 0} duration={1.5} separator="," /></div>
            <div className="text-sm text-muted-foreground w-full flex items-center justify-between">
              <span>Ongoing Orders</span>
              <span className="text-blue-500 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 5%</span>
            </div>
          </div>
        </div>

        <div className={`bg-card/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_10px_rgba(139,92,246,0.05)] hover:shadow-[0_0_15px_rgba(139,92,246,0.08)] hover:dark:shadow-[0_0_15px_rgba(139,92,246,0.08)] rounded-2xl p-4 md:p-6 hover:scale-[1.03] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${step === 0 ? "ring-2 ring-purple-400 scale-[1.02]" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10 w-full">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6 text-purple-500 group-hover:rotate-6 transition-transform" />
            </div>
            <div className="h-10 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="value" stroke="#a78bfa" opacity={0.7} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-semibold mb-1"><CountUp end={data?.stats?.completedTransactions || 0} duration={1.5} separator="," /></div>
            <div className="text-sm text-muted-foreground w-full flex items-center justify-between">
              <span>Completed</span>
              <span className="text-purple-500 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 18%</span>
            </div>
          </div>
        </div>

        <div className={`bg-card/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_10px_rgba(245,158,11,0.05)] hover:shadow-[0_0_15px_rgba(245,158,11,0.08)] hover:dark:shadow-[0_0_15px_rgba(245,158,11,0.08)] rounded-2xl p-4 md:p-6 hover:scale-[1.03] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${step === 0 ? "ring-2 ring-orange-400 scale-[1.02]" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10 w-full">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-orange-500 group-hover:rotate-6 transition-transform" />
            </div>
            <div className="h-10 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="value" stroke="#fbbf24" opacity={0.7} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-semibold mb-1">
              <CountUp end={data?.stats?.monthlyRevenue || 0} duration={1.5} separator="," prefix="Rs " />
            </div>
            <div className="text-sm text-muted-foreground w-full flex items-center justify-between">
              <span>Total Revenue</span>
              <span className={`text-xs flex items-center gap-1 ${(data?.stats?.growth || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                {(data?.stats?.growth || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(data?.stats?.growth || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative">
        {step === 3 && <div className="absolute -top-6 left-2 font-medium text-green-500 animate-pulse text-sm flex items-center gap-2"><span>🧠</span> AI Insights</div>}
        <div className={`md:col-span-2 bg-card/60 backdrop-blur-md shadow-sm border border-border/50 p-5 rounded-2xl flex items-center justify-center text-sm font-medium text-foreground transition-all duration-300 ${step === 3 ? "ring-2 ring-green-400 scale-[1.02]" : ""}`}>
          {(() => {
            let insight = "No data yet";
            const growth = data?.stats?.growth || 0;
            if (growth > 15) insight = "🚀 Strong growth! You're scaling fast.";
            else if (growth > 5) insight = "📈 Good progress. Keep momentum.";
            else if (growth < 0) insight = "⚠️ Drop detected. Try increasing listings.";
            else insight = "📊 Stable performance.";
            
            return insight;
          })()}
        </div>
        
        <div className={`bg-card/60 backdrop-blur-md shadow-sm border border-border/50 p-5 rounded-2xl flex flex-col justify-center transition-all duration-300 ${step === 3 ? "ring-2 ring-green-400 scale-[1.02]" : ""}`}>
          <div className="text-sm flex flex-col space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground"><span className="text-lg">🌾</span> Best Selling: <b className="text-foreground">{data.bestSelling || "N/A"}</b></div>
            <div className="flex items-center gap-2 text-muted-foreground"><span className="text-lg">📍</span> Top Market: <b className="text-foreground">{topLocation?.[0] || "N/A"}</b></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 mt-6 relative">
        {step === 1 && <div className="absolute -top-6 left-2 font-medium text-green-500 animate-pulse text-sm flex items-center gap-2"><span>📈</span> Sales trend</div>}
        {step === 2 && <div className="absolute -top-6 left-[51%] font-medium text-green-500 animate-pulse text-sm flex items-center gap-2"><span>🌾</span> Crop distribution</div>}
        <div className={`bg-card/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 hover:shadow-[0_0_15px_rgba(34,197,94,0.08)] transition-all duration-300 ${step === 1 ? "ring-2 ring-green-400 scale-[1.02]" : ""}`}>
          <h2 className="text-xl font-semibold mb-6">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            {salesData[0].month === "No Data" ? (
              <div className="flex items-center justify-center h-full text-muted-foreground font-medium">📊 No data yet — start selling to see insights</div>
            ) : (
              <LineChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#4ade80" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} dy={10} />
                <YAxis 
                  stroke="var(--color-muted-foreground)" 
                  tickLine={false} 
                  axisLine={false} 
                  width={80}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `Rs ${(value / 1000).toFixed(0)}K`;
                    return `Rs ${value}`;
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="sales" stroke="url(#colorGradient)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#22c55e' }} activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff' }} isAnimationActive={true} animationDuration={1000} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className={`bg-card/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 hover:shadow-[0_0_15px_rgba(34,197,94,0.08)] transition-all duration-300 w-full overflow-x-auto ${step === 2 ? "ring-2 ring-green-400 scale-[1.02]" : ""}`}>
          <h2 className="text-xl font-semibold mb-6">Paddy Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            {paddyDistribution.length === 0 ? (
               <div className="flex items-center justify-center h-full text-muted-foreground font-medium">📊 No data yet — start selling to see insights</div>
            ) : (
              <PieChart>
              <Pie
                data={paddyDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={800}
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
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-card/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col">
        <div className="p-6 border-b border-border/50">
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
                    <button onClick={() => navigate(`/farmer/transactions/${item.id}`)} className="text-green-500 hover:text-green-400 font-medium hover:underline text-sm transition-colors">View Details</button>
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
