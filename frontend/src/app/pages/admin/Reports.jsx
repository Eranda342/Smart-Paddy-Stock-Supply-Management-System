import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FileText, TrendingUp, Users, Package, Receipt, Award, MapPin, Truck, Download, Crosshair, Calendar, X } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { generateReportPDF } from '../../../utils/pdfGenerator';

import { getRangeDates, filterByDate, computeTrendData, computeDistributions, computeStats, getRangeLabel } from '../../../utils/analyticsEngine';

const API_BASE = 'http://localhost:5000/api/admin/analytics';
const API_TXN = 'http://localhost:5000/api/admin/transactions';
const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [overview, setOverview] = useState({ totalUsers: 0, totalTransactions: 0, totalRevenue: 0, totalListings: 0, completedDeliveries: 0 });
  const [conversion, setConversion] = useState({ rate: 0, acceptedNegotiations: 0, transactions: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [paddyData, setPaddyData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [transactionsRaw, setTransactionsRaw] = useState([]);
  const revenueChartRef = useRef(null);
  const usersChartRef = useRef(null);

  // Date Filtering State
  const [range, setRange] = useState('1y');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [appliedCustomRange, setAppliedCustomRange] = useState(null);
  const [dateError, setDateError] = useState("");
  const datePickerRef = useRef(null);

  // Close date picker on outer click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setRange("custom"); // signal the engine to use custom grouping logic
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

  const [rawTransactionsAll, setRawTransactionsAll] = useState([]);
  const trendCache = useRef(new Map()); // in-memory cache: cacheKey → salesDataArray

  // ── Fetch raw data ONCE (or on manual refresh) ────────────────────────────
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [oRes, cRes, uRes, tRes] = await Promise.all([
          fetch(`${API_BASE}/overview?range=all`, { headers }),
          fetch(`${API_BASE}/conversion?range=all`, { headers }),
          fetch(`${API_BASE}/users?range=all`, { headers }),
          fetch(`${API_TXN}?range=all`, { headers })
        ]);

        if (!oRes.ok || !uRes.ok || !cRes.ok || !tRes.ok) throw new Error('Failed to fetch analytics');

        const rawOverview = await oRes.json();
        setConversion(await cRes.json());
        setUsersData(await uRes.json());

        const txnData = await tRes.json();
        const allTxns = txnData.transactions || [];
        setRawTransactionsAll(allTxns);

        // Store backend-level totals (users/listings don't filter client-side)
        setOverview(prev => ({
          ...prev,
          totalUsers:    rawOverview.totalUsers    || 0,
          totalListings: rawOverview.totalListings || 0
        }));
      } catch (err) {
        toast.error('Error loading analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []); // fetch once

  // ── Recompute derived data whenever range or raw data changes ─────────────
  useEffect(() => {
    if (rawTransactionsAll.length === 0) return; // nothing to compute yet

    const { startDate, endDate } = getRangeDates(range, appliedCustomRange);
    const filteredTxns = filterByDate(rawTransactionsAll, startDate, endDate);

    console.log('[Admin Analytics] startDate:', startDate, 'endDate:', endDate);
    console.log('[Admin Analytics] Filtered count:', filteredTxns.length);

    const computedStats = computeStats(filteredTxns, []);

    // Use cache for expensive trend computation
    const cacheKey = `${range}|${String(startDate)}|${String(endDate)}|${filteredTxns.length}`;
    let salesDataArray;
    if (trendCache.current.has(cacheKey)) {
      salesDataArray = trendCache.current.get(cacheKey);
    } else {
      salesDataArray = computeTrendData(filteredTxns, startDate, endDate, range, appliedCustomRange);
      if (trendCache.current.size >= 10) trendCache.current.delete(trendCache.current.keys().next().value);
      trendCache.current.set(cacheKey, salesDataArray);
    }

    const { paddyData: computedPaddy, districtData: computedDistrict } = computeDistributions(filteredTxns);

    console.log('[Admin Analytics] Trend data points:', salesDataArray.length);

    setOverview(prev => ({
      ...prev,
      totalTransactions:   computedStats.totalTransactions,
      totalRevenue:        computedStats.totalRevenue,
      completedDeliveries: computedStats.completedDeliveries
    }));

    setRevenueData(salesDataArray);
    setPaddyData(computedPaddy);
    setDistrictData(computedDistrict);
    setTransactionsRaw(filteredTxns);
  }, [range, appliedCustomRange, rawTransactionsAll]);

  // ── Derived values for exports — memoised, don't recompute on every render ──
  const avgTxnValueCalc = useMemo(() =>
    overview.totalTransactions > 0
      ? Math.round(overview.totalRevenue / overview.totalTransactions)
      : 0
  , [overview.totalRevenue, overview.totalTransactions]);

  const deliveryRateCalc = useMemo(() =>
    overview.totalTransactions > 0
      ? ((overview.completedDeliveries / overview.totalTransactions) * 100).toFixed(1)
      : '0.0'
  , [overview.completedDeliveries, overview.totalTransactions]);

  const topPaddyCalc = useMemo(() =>
    paddyData.length > 0 ? [...paddyData].sort((a,b) => b.value - a.value)[0].name : '—'
  , [paddyData]);

  const topDistrictCalc = useMemo(() =>
    districtData.length > 0 ? [...districtData].sort((a,b) => b.value - a.value)[0].name : '—'
  , [districtData]);

  const generatedAt = useMemo(
    () => new Date().toLocaleString('en-LK', { dateStyle: 'long', timeStyle: 'short' }),
    [] // computed once at mount — report generation timestamp
  );

  // ─── Export Excel (multi-sheet) ─────────────────────────────────────────────
  const exportExcel = () => {
    if (transactionsRaw.length === 0) return toast.error('No transaction data available to export');

    const wb = XLSX.utils.book_new();

    const fmtPdfDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" }) : '';
    let periodLabel = "Last 12 Months";
    if (appliedCustomRange) {
      periodLabel = `${fmtPdfDate(appliedCustomRange.startDate)} to ${fmtPdfDate(appliedCustomRange.endDate)}`;
    } else if (range === "7d") {
      periodLabel = "Last 7 Days";
    } else if (range === "30d") {
      periodLabel = "Last 30 Days";
    }

    // ── Sheet 1: Platform Summary ──────────────────────────────────────────
    const summaryRows = [
      ['AgroBridge'],
      ['Report Name:', 'Platform Analytics Report'],
      [`Generated On:`, generatedAt],
      [`Report Period:`, periodLabel],
      [],
      ['PLATFORM OVERVIEW'],
      ['Metric', 'Value'],
      ['Total Revenue', `Rs ${overview.totalRevenue.toLocaleString()}`],
      ['Total Transactions', overview.totalTransactions],
      ['Total Users', overview.totalUsers],
      ['Total Listings', overview.totalListings],
      ['Avg Transaction Value', `Rs ${Math.round(avgTxnValueCalc).toLocaleString()}`],
      ['Overall Conversion Rate (%)', conversion.rate],
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
  const getChartImage = async (ref) => {
    if (ref && ref.current) {
      try {
        const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff' });
        return canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Failed to capture chart", err);
        return null;
      }
    }
    return null;
  };

  const exportPDF = async () => {
    if (transactionsRaw.length === 0) return toast.error('No transaction data available to export');

    setIsExporting(true);
    const loadingToast = toast.loading('Generating PDF...');
    try {
      const revenueImage = await getChartImage(revenueChartRef);
      const usersImage = await getChartImage(usersChartRef);
      await generateReportPDF({
        data: { overview, conversion, revenueData, usersData, paddyData, districtData, transactionsRaw },
        chartImages: { revenue: revenueImage, users: usersImage },
        startDate: appliedCustomRange?.startDate || null,
        endDate: appliedCustomRange?.endDate || null,
        range: range,
        forEmail: false
      });
      toast.success('PDF report downloaded!', { id: loadingToast });
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error(`PDF export failed: ${err.message}`, { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAndEmail = async () => {
    if (transactionsRaw.length === 0) return toast.error('No transaction data available to export');

    setIsExporting(true);
    const loadingToast = toast.loading('Generating and sending email...');
    try {
      const revenueImage = await getChartImage(revenueChartRef);
      const usersImage = await getChartImage(usersChartRef);
      const pdfBlob = await generateReportPDF({
        data: { overview, conversion, revenueData, usersData, paddyData, districtData, transactionsRaw },
        chartImages: { revenue: revenueImage, users: usersImage },
        forEmail: true
      });

      const reader = new FileReader();
      const pdfBase64 = await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          resolve(base64data);
        };
        reader.readAsDataURL(pdfBlob);
      });

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/reports/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          startDate: appliedCustomRange?.startDate || '',
          endDate: appliedCustomRange?.endDate || '',
          range: range,
          pdfBase64
        })
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || 'Report exported and emailed successfully!', { id: loadingToast });
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (err) {
      console.error('Email export error:', err);
      toast.error(err.message || 'Failed to send email', { id: loadingToast });
    } finally {
      setIsExporting(false);
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
        <div className="flex flex-col items-end gap-4">
          
          {/* Date Filter Strip */}
          <div className="flex items-center p-1 rounded-xl gap-1" style={{ background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.06)' }}>
            {[['7d','7 Days'],['30d','30 Days'],['1y','1 Year']].map(([val, label]) => (
              <button key={val} onClick={() => { setRange(val); handleClearCustomRange(); }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  range === val && !appliedCustomRange 
                    ? 'bg-[#22C55E] text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5'
                }`}
              >
                {label}
              </button>
            ))}
            {/* Custom Range button */}
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(prev => !prev)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  appliedCustomRange 
                    ? 'bg-[#22C55E] text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {appliedCustomRange ? `${formatDisplayDate(appliedCustomRange.startDate)} → ${formatDisplayDate(appliedCustomRange.endDate)}` : 'Custom Range'}
              </button>
              {showDatePicker && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-50 p-4 rounded-2xl shadow-2xl min-w-[280px]"
                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-xs font-semibold mb-3 text-white/70">SELECT DATE RANGE</p>
                  <div className="space-y-3" style={{ colorScheme: 'dark' }}>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={customStart}
                        max={today}
                        onChange={e => { setCustomStart(e.target.value); setDateError(""); }}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-[#22C55E]/50"
                        style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={customEnd}
                        min={customStart || undefined}
                        max={today}
                        onChange={e => { setCustomEnd(e.target.value); setDateError(""); }}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-[#22C55E]/50"
                        style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    {dateError && <p className="text-xs text-red-400">{dateError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleApplyCustomRange}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all text-black hover:opacity-90"
                        style={{ background: '#22C55E' }}
                      >
                        Apply
                      </button>
                      {appliedCustomRange && (
                        <button
                          onClick={() => { handleClearCustomRange(); setShowDatePicker(false); }}
                          className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/20"
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

          <div className="flex gap-3">
            <button onClick={exportAndEmail} disabled={isExporting} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <FileText className="w-4 h-4" /> {isExporting ? 'Processing...' : 'Export & Email'}
            </button>
            <button onClick={exportPDF} disabled={isExporting} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button onClick={exportExcel} disabled={isExporting} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
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
              <div className="text-sm font-semibold mt-1">{topPaddyCalc}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <MapPin className="w-6 h-6 text-rose-500 mb-2" />
              <div className="text-xs text-muted-foreground">Top District</div>
              <div className="text-sm font-semibold mt-1">{topDistrictCalc}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <Receipt className="w-6 h-6 text-emerald-500 mb-2" />
              <div className="text-xs text-muted-foreground">Avg Transaction</div>
              <div className="text-sm font-semibold mt-1">Rs {Math.round(avgTxnValueCalc).toLocaleString()}</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
              <div className="text-xs text-muted-foreground">Conversion Rate</div>
              <div className="text-sm font-semibold mt-1">{conversion.rate}%</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <Truck className="w-6 h-6 text-teal-500 mb-2" />
              <div className="text-xs text-muted-foreground">Delivery Success</div>
              <div className="text-sm font-semibold mt-1">{deliveryRateCalc}%</div>
            </div>
          </div>

          {/* CHARTS LAYER 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Line Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm" ref={revenueChartRef}>
              <h2 className="text-lg font-semibold mb-6">
                Revenue Trend ({getRangeLabel(range, appliedCustomRange)})
              </h2>
              {revenueData.length === 0 ? (
                 <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#1f2937" 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      interval={revenueData.length > 14 ? Math.ceil(revenueData.length / 10) - 1 : 0}
                    />
                    <YAxis stroke="#1f2937" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(val) => `Rs ${val.toLocaleString()}`}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5} strokeLinecap="round" dot={false} activeDot={{ r: 5, fill: '#22C55E', strokeWidth: 2, stroke: 'rgba(34,197,94,0.3)' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* User Distribution Bar Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm" ref={usersChartRef}>
              <h2 className="text-lg font-semibold mb-6">User Growth (Farmers vs Mills)</h2>
              {usersData.length === 0 ? (
                 <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#1f2937" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <YAxis stroke="#1f2937" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} tickFormatter={(v) => Math.floor(v)} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold', marginBottom: '4px' }}
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
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#9ca3af', fontWeight: 'bold', marginBottom: '4px' }}
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                    <XAxis type="number" stroke="#1f2937" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} tickFormatter={(v) => Math.floor(v)} />
                    <YAxis type="category" dataKey="name" stroke="#1f2937" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold', marginBottom: '4px' }}
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
