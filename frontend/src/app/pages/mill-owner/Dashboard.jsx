import { TrendingUp, TrendingDown, ShoppingCart, MessageSquare, Package, DollarSign, MapPin, Leaf, FileText, FileSpreadsheet, Zap, BarChart2, Calendar, X } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { useTheme } from "../../contexts/ThemeContext";
import CountUp from "react-countup";
import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

export default function MillOwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [step, setStep] = useState(0);
  // Custom date range state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [appliedCustomRange, setAppliedCustomRange] = useState(null);
  const [dateError, setDateError] = useState("");
  const datePickerRef = useRef(null);
  const salesChartRef = useRef(null);
  const distChartRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Close date picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        let url = `http://localhost:5000/api/dashboard/millOwner?range=${range}`;
        if (appliedCustomRange) {
          url = `http://localhost:5000/api/dashboard/millOwner?range=${range}&startDate=${appliedCustomRange.startDate}&endDate=${appliedCustomRange.endDate}`;
        }
        const res = await fetch(url, {
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
  }, [range, refreshTrigger, appliedCustomRange]);

  // Custom range helpers
  const today = new Date().toISOString().split("T")[0];

  const handleApplyCustomRange = () => {
    setDateError("");
    if (!customStart || !customEnd) {
      setDateError("Please select both start and end dates.");
      return;
    }
    if (new Date(customEnd) < new Date(customStart)) {
      setDateError("End date cannot be before start date.");
      return;
    }
    setAppliedCustomRange({ startDate: customStart, endDate: customEnd });
    setRange("all");
    setShowDatePicker(false);
  };

  const handleClearCustomRange = () => {
    setAppliedCustomRange(null);
    setCustomStart("");
    setCustomEnd("");
    setDateError("");
  };

  const formatDisplayDate = (iso) => {
    return new Date(iso).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
  };

  
  const exportExcel = () => {
    const hasAnyData = Object.keys(data?.distribution || {}).length > 0 || Object.keys(data?.monthly || {}).length > 0 || (data?.recent?.length || 0) > 0;
    const now = new Date();
    
    if (!hasAnyData) {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([["No data available for selected period"]]);
      XLSX.utils.book_append_sheet(wb, ws, "Summary");
      XLSX.writeFile(wb, `AgroBridge_No_Data_Report_${now.toISOString().slice(0, 10)}.xlsx`);
      return;
    }
    
    const fmtPdfDate = (iso) => new Date(iso).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
    let periodLabel = appliedCustomRange 
      ? `${fmtPdfDate(appliedCustomRange.startDate)} → ${fmtPdfDate(appliedCustomRange.endDate)}` 
      : range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "All Time";
    let rangeSlug = appliedCustomRange ? `${appliedCustomRange.startDate}_to_${appliedCustomRange.endDate}` : (range === "7d" ? "Last-7-Days" : range === "30d" ? "Last-30-Days" : "All-Time");
    
    // Sheet 1: Summary
    const fmt = (n) => new Intl.NumberFormat("en-LK").format(n || 0);
    const summaryData = [
      ["AgroBridge Analytics Report"],
      [],
      ["Generated On:", now.toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })],
      ["Period:", periodLabel],
      [],
      ["SUMMARY"],
      [],
      ["Total Spend:", `Rs ${fmt(data?.stats?.totalSpend)}`],
      ["Monthly Procurement (kg):", fmt(data?.stats?.monthlyProcurementKg)],
      ["Best Selling Paddy:", data?.bestSelling || "N/A"],
      ["Highest Sourcing Area:", Object.entries(data?.locations || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"]
    ];
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    if (!wsSummary["!cols"]) wsSummary["!cols"] = [];
    wsSummary["!cols"] = [{ wch: 25 }, { wch: 30 }];
    
    // Sheet 2: Transactions
    const headers = [["Date", "Paddy Type", "Quantity (kg)", "Price (Rs)", "District", "Buyer/Seller"]];
    const rows = (data.recent || []).map(t => [
      new Date(t.createdAt).toLocaleDateString("en-LK"),
      t.listing?.paddyType || "N/A",
      t.quantityKg || 0,
      t.totalAmount || t.totalPrice || t.price || 0,
      t.listing?.location?.district || "N/A",
      t.farmer?.fullName || t.seller?.fullName || "N/A"
    ]);
    
    const wsTransactions = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    wsTransactions["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 }];
    wsTransactions["!freeze"] = { xSplit: 0, ySplit: 1 };
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");
    XLSX.writeFile(wb, `AgroBridge_Report_${rangeSlug}.xlsx`);
  };

  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const GREEN  = [34, 197, 94];
    const DARK   = [15, 23, 42];
    const GRAY   = [100, 116, 139];
    const LIGHT  = [248, 250, 252];
    const now    = new Date();

    const fmt = (n) => new Intl.NumberFormat("en-LK").format(n || 0);
    const fmtCur = (n) => `Rs. ${fmt(n)}`;

    // -- Header Banner (Enhanced with Period) --
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 48, "F");
    doc.setFillColor(...GREEN);
    doc.rect(0, 45, W, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("AgroBridge", 14, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 220, 150);
    doc.text("Mill Owner Procurement Report", 14, 22);

    doc.setFontSize(8);
    doc.setTextColor(100, 180, 100);
    doc.text(`Generated on: ${now.toLocaleDateString("en-LK", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}  |  ${now.toLocaleTimeString("en-LK")}`, 14, 30);

    // Period label
    const fmtPdfDate = (iso) => new Date(iso).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
    let periodLabel;
    if (appliedCustomRange) {
      periodLabel = `Period: ${fmtPdfDate(appliedCustomRange.startDate)}  →  ${fmtPdfDate(appliedCustomRange.endDate)}`;
    } else {
      periodLabel = `Period: ${range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "All Time"}`;
    }
    doc.setFontSize(8);
    doc.setTextColor(180, 230, 180);
    doc.text(periodLabel, 14, 38);

    // Range badge (top-right pill)
    const badgeLabel = appliedCustomRange
      ? `${fmtPdfDate(appliedCustomRange.startDate)} -> ${fmtPdfDate(appliedCustomRange.endDate)}`
      : (range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "All Time");
    doc.setFontSize(7);
    const badgeW = Math.max(32, doc.getTextWidth(badgeLabel) + 8);
    doc.setFillColor(...GREEN);
    doc.roundedRect(W - badgeW - 8, 10, badgeW, 10, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(badgeLabel, W - badgeW / 2 - 8, 16.5, { align: "center" });

    let y = 58;

    // No-data guard
    const hasAnyData =
      Object.keys(data?.distribution || {}).length > 0 ||
      Object.keys(data?.monthly || {}).length > 0 ||
      (data?.recent?.length || 0) > 0;
    if (!hasAnyData) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(...GRAY);
      doc.text("No data available for the selected period.", W / 2, y + 20, { align: "center" });
      doc.save(`AgroBridge_No_Data_Report_${now.toISOString().slice(0, 10)}.pdf`);
      return;
    }


    // â”€â”€ Section: Executive Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      { label: "Active Purchases",       value: fmt(data?.stats?.activePurchases) },
      { label: "Ongoing Negotiations",   value: fmt(data?.stats?.ongoingNegotiations) },
      { label: "Monthly Procurement",    value: `${fmt(data?.stats?.monthlyProcurementKg)} kg` },
      { label: "Total Spend",            value: fmtCur(data?.stats?.totalSpend) },
      { label: "Best Selling Type",      value: data?.bestSelling || "N/A" },
      { label: "Highest Sourcing Area",  value: topLocationStr || "N/A" },
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

    // ── Charts Capture ──────────────────────────────────────────
    if (salesChartRef.current || distChartRef.current) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (salesChartRef.current && salesData && salesData.length > 0 && salesData[0].month !== "No Data") {
      try {
        const canvas = await html2canvas(salesChartRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...DARK);
        doc.text("Procurement Trend", 14, y);
        y += 2;
        doc.setDrawColor(...GREEN);
        doc.setLineWidth(0.5);
        doc.line(14, y, W - 14, y);
        y += 4;
        
        const imgProps = doc.getImageProperties(imgData);
        let imgWidth = W - 28;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        if (y + imgHeight > H - 20) { doc.addPage(); y = 20; }
        
        doc.addImage(imgData, "PNG", 14, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch (err) {
        console.error("Could not generate sales chart", err);
      }
    }

    if (distChartRef.current && procurementData && procurementData.length > 0 && procurementData[0].type !== "No Data") {
      try {
        const canvas = await html2canvas(distChartRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        
        if (y + 10 > H - 20) { doc.addPage(); y = 20; }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...DARK);
        doc.text("Procurement Distribution", 14, y);
        y += 2;
        doc.setDrawColor(...GREEN);
        doc.setLineWidth(0.5);
        doc.line(14, y, W - 14, y);
        y += 4;
        
        const imgProps = doc.getImageProperties(imgData);
        let imgWidth = W - 28;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        if (y + imgHeight > H - 20) { doc.addPage(); y = 20; }
        
        doc.addImage(imgData, "PNG", 14, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch (err) {
        console.error("Could not generate dist chart", err);
      }
    }


    // â”€â”€ Section: Monthly Procurement Trend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("Monthly Procurement Trend", 14, y);
    y += 2;
    doc.setDrawColor(...GREEN);
    doc.line(14, y, W - 14, y);
    y += 4;

    const last6Months = generateLast6Months();
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

    // â”€â”€ Section: Procurement by Paddy Type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("Procurement by Paddy Type", 14, y);
    y += 2;
    doc.setDrawColor(...GREEN);
    doc.line(14, y, W - 14, y);
    y += 4;

    const distEntries = Object.entries(data?.distribution || {})
      .sort((a, b) => b[1] - a[1]);
    const totalKg = distEntries.reduce((s, [, v]) => s + v, 0);
    const distRows = distEntries.map(([type, qty]) => [
      type,
      `${fmt(qty)} kg`,
      totalKg > 0 ? `${((qty / totalKg) * 100).toFixed(1)}%` : "0%",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Paddy Type", "Quantity (kg)", "Share (%)"]],
      body: distRows.length ? distRows : [["No data", "-", "-"]],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3.5, textColor: DARK },
      headStyles: { fillColor: GREEN, textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // new page if needed
    if (y > H - 70) { doc.addPage(); y = 20; }

    // â”€â”€ Section: Recent Purchases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("Recent Purchases", 14, y);
    y += 2;
    doc.setDrawColor(...GREEN);
    doc.line(14, y, W - 14, y);
    y += 4;

    const recentRows = recentActivity.map(r => [
      r.date,
      r.farmer,
      r.paddyType,
      r.quantity,
      r.price,
      r.status,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Date", "Farmer", "Paddy Type", "Qty", "Price", "Status"]],
      body: recentRows.length ? recentRows : [["No recent activity", "", "", "", "", ""]],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, textColor: DARK },
      headStyles: { fillColor: GREEN, textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "center" },
      },
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
      doc.setTextColor(100, 180, 100);
      doc.text(`Page ${p} of ${pageCount}`, W - 14, H - 4.5, { align: "right" });
    }

    const rangeSlug = appliedCustomRange
      ? `${appliedCustomRange.startDate}_to_${appliedCustomRange.endDate}`
      : (range === "7d" ? "Last-7-Days" : range === "30d" ? "Last-30-Days" : "All-Time");
    const filename = `AgroBridge_MillOwner_Report_${rangeSlug}_${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center text-[#22C55E] font-medium">Loading metrics...</div>;
  if (error || !data) return <div className="flex h-[50vh] items-center justify-center text-red-500 font-medium">{error || "No data"}</div>;

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

  const procurementData = Object.keys(data.distribution || {}).length > 0
    ? Object.keys(data.distribution).map(type => ({
      type,
      quantity: data.distribution[type]
    }))
    : [{ type: "No Data", quantity: 0 }];

  const recentActivity = (data.recent || []).map((t, idx) => {
    let statusColor = 'text-gray-500 bg-gray-500/10';
    let mappedStatus = 'Pending';
    
    if (t.status === 'COMPLETED' || t.status === 'DELIVERED') {
      statusColor = 'text-green-500 bg-green-500/10';
      mappedStatus = 'Completed';
    }
    else if (t.status === 'DELIVERY_IN_PROGRESS') {
      statusColor = 'text-blue-500 bg-blue-500/10';
      mappedStatus = 'In Transit';
    }
    else if (t.status === 'ORDER_CREATED' || t.status === 'PAYMENT_COMPLETED' || t.status === 'TRANSPORT_PENDING') {
      statusColor = 'text-yellow-500 bg-yellow-500/10';
      mappedStatus = 'Pending';
    }
    
    return {
      id: t._id || idx,
      date: new Date(t.createdAt).toLocaleDateString(),
      farmer: t.farmer?.fullName || "Farmer",
      paddyType: t.listing?.paddyType || "Paddy",
      quantity: `${t.quantityKg || 0} kg`,
      price: new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(t.totalAmount || 0),
      status: mappedStatus,
      statusColor
    };
  });

  const sparkData = last6Months.map(month => ({
    month,
    value: data?.monthly?.[month] || 0
  }));

  const topLocationEntry = Object.entries(data.locations || {}).sort((a, b) => b[1] - a[1])[0];
  const topLocationStr = topLocationEntry?.[0] || "N/A";

  return (
    <div id="dashboard-content" className="w-full relative">

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
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
            Mill Owner Portal
          </div>
          <h1 className="text-4xl font-bold mb-1.5" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>Overview of your procurement activities</p>
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
              <button key={val} onClick={() => { setRange(val); handleClearCustomRange(); }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
                style={range === val && !appliedCustomRange ? { background: '#22C55E', color: '#000', boxShadow: '0 0 12px rgba(34,197,94,0.3)' } : { color: 'rgba(148,163,184,0.7)' }}>
                {label}
              </button>
            ))}
            {/* Custom Range button */}
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(prev => !prev)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
                style={appliedCustomRange ? {
                  background: '#22C55E', color: '#000', boxShadow: '0 0 12px rgba(34,197,94,0.3)'
                } : {
                  color: 'rgba(148,163,184,0.7)'
                }}
              >
                <Calendar className="w-3.5 h-3.5" />
                {appliedCustomRange ? `${formatDisplayDate(appliedCustomRange.startDate)} → ${formatDisplayDate(appliedCustomRange.endDate)}` : 'Custom Range'}
              </button>
              {showDatePicker && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-50 p-4 rounded-2xl shadow-2xl min-w-[280px]"
                  style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(148,163,184,0.7)' }}>SELECT DATE RANGE</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={customStart}
                        max={today}
                        onChange={e => { setCustomStart(e.target.value); setDateError(""); }}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#22C55E]/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={customEnd}
                        min={customStart || undefined}
                        max={today}
                        onChange={e => { setCustomEnd(e.target.value); setDateError(""); }}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#22C55E]/50"
                      />
                    </div>
                    {dateError && <p className="text-xs text-red-400">{dateError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleApplyCustomRange}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{ background: '#22C55E', color: '#000' }}
                      >
                        Apply
                      </button>
                      {appliedCustomRange && (
                        <button
                          onClick={() => { handleClearCustomRange(); setShowDatePicker(false); }}
                          className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button onClick={exportExcel}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#000', boxShadow: '0 0 20px rgba(16,185,129,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(16,185,129,0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.25)'}>
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)', color: '#000', boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(34,197,94,0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(34,197,94,0.25)'}>
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { icon: ShoppingCart, color: '#22C55E', label: 'Active Purchases',      value: data?.stats?.activePurchases       || 0, growth: 8,  prefix: '',     suffix: '' },
          { icon: MessageSquare,color: '#3B82F6', label: 'Ongoing Negotiations',  value: data?.stats?.ongoingNegotiations   || 0, growth: 12, prefix: '',     suffix: '' },
          { icon: Package,      color: '#A855F7', label: 'Monthly Procurement',   value: data?.stats?.monthlyProcurementKg  || 0, growth: 15, prefix: '',     suffix: ' kg' },
          { icon: DollarSign,   color: '#F59E0B', label: 'Total Spend',           value: data?.stats?.totalSpend            || 0, growth: data?.stats?.growth||0, prefix: 'Rs ', suffix: '' },
        ].map(({ icon: Icon, color, label, value, growth, prefix, suffix }, i) => (
          <div key={i}
            className="relative overflow-hidden rounded-2xl p-6 border cursor-default group transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 0 30px ${color}22, 0 12px 40px rgba(0,0,0,0.3)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(ellipse at 10% 10%, ${color}18 0%, transparent 60%)` }} />
            <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)`, border: `1px solid ${color}25` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: growth >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: growth >= 0 ? '#22C55E' : '#EF4444' }}>
                {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(growth).toFixed(1)}%
              </div>
            </div>

            <div className="text-3xl font-bold mb-1.5 tabular-nums tracking-tight text-white">
              <CountUp end={value} duration={1.5} separator="," prefix={prefix} suffix={suffix} />
            </div>
            <div className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Insight Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Procurement insight */}
        <div className="md:col-span-2 rounded-2xl p-5 flex items-center gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Zap className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(148,163,184,0.6)' }}>PROCUREMENT INSIGHT</p>
            <p className="text-sm font-medium text-white">
              {(() => {
                const growth = data?.stats?.growth || 0;
                if (growth > 0) return `Procurement increased ${growth.toFixed(1)}% this month. Keep sourcing to maintain momentum.`;
                if (growth < 0) return `Procurement decreased ${Math.abs(growth).toFixed(1)}% this month. Consider expanding your sourcing locations.`;
                return 'Procurement is stable. Explore new paddy types and districts to diversify supply.';
              })()}
            </p>
          </div>
        </div>

        {/* Most Bought + Highest Sourcing */}
        <div className="rounded-2xl p-5 flex flex-col justify-center gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <Leaf className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>Most Purchased</p>
              <p className="text-sm font-bold text-white">{data.bestSelling || 'N/A'}</p>
            </div>
          </div>
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <MapPin className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>Highest Sourcing Area</p>
              <p className="text-sm font-bold text-white">{topLocationStr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Procurement Trend - Area chart */}
        <div ref={salesChartRef} className="rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(34,197,94,0.08)]"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Procurement Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>Monthly spending - Last 6 months</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>6M</span>
          </div>
          {salesData[0].month === 'No Data' ? (
            <div className="flex flex-col items-center justify-center h-64 text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
              <BarChart2 className="w-8 h-8 mb-3 opacity-30" />
              No data yet - start procuring to see insights
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="millAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#22C55E" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="millStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.7)' }} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.7)' }} tickLine={false} axisLine={false} width={72}
                  tickFormatter={v => v >= 1000000 ? `Rs ${(v/1000000).toFixed(1)}M` : v >= 1000 ? `Rs ${(v/1000).toFixed(0)}K` : `Rs ${v}`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)' }}
                  cursor={{ stroke: 'rgba(34,197,94,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  labelStyle={{ color: 'rgba(148,163,184,0.7)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  itemStyle={{ color: '#22C55E', fontWeight: 700 }} />
                <Area type="monotone" dataKey="sales" name="Spend"
                  stroke="url(#millStrokeGrad)" strokeWidth={2.5} fill="url(#millAreaGrad)"
                  dot={false} activeDot={{ r: 6, fill: '#22C55E', strokeWidth: 2, stroke: 'rgba(34,197,94,0.3)' }}
                  isAnimationActive animationDuration={1200} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Procurement by Paddy Type - Bar chart */}
        <div ref={distChartRef} className="rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(59,130,246,0.06)]"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Procurement by Paddy Type</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>Quantity sourced by type (kg)</p>
            </div>
          </div>
          {procurementData[0].type === 'No Data' ? (
            <div className="flex flex-col items-center justify-center h-64 text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
              <Leaf className="w-8 h-8 mb-3 opacity-30" />
              No procurement data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={procurementData} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="millBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="type" stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.7)' }} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.7)' }} tickLine={false} axisLine={false} width={70}
                  allowDecimals={false}
                  tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : `${v}`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 4 }}
                  labelStyle={{ color: 'rgba(148,163,184,0.7)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  itemStyle={{ color: '#22C55E', fontWeight: 700 }}
                  formatter={v => [`${v.toLocaleString()} kg`, 'Quantity']} />
                <Bar dataKey="quantity" fill="url(#millBarGrad)" radius={[6,6,0,0]}
                  isAnimationActive animationDuration={900} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Purchases Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-base font-semibold text-white">Recent Purchases</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>Latest procurement transactions</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Date','Farmer','Paddy Type','Quantity','Price','Status','Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.6)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12" style={{ color: 'rgba(148,163,184,0.5)' }}>No recent purchases</td></tr>
              ) : recentActivity.map((item) => (
                <tr key={item.id}
                  className="transition-colors duration-150"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-4" style={{ color: 'rgba(226,232,240,0.7)' }}>{item.date}</td>
                  <td className="px-5 py-4 font-medium text-white">{item.farmer}</td>
                  <td className="px-5 py-4" style={{ color: 'rgba(226,232,240,0.85)' }}>{item.paddyType}</td>
                  <td className="px-5 py-4" style={{ color: 'rgba(226,232,240,0.7)' }}>{item.quantity}</td>
                  <td className="px-5 py-4 font-medium" style={{ color: '#22C55E' }}>{item.price}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => navigate(`/mill-owner/transactions/${item.id}`)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}>
                      View
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
