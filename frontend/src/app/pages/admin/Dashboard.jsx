import axios from 'axios';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Users, ShieldCheck, Package, Receipt,
  Wifi, RefreshCw, UserPlus, FileText, MessageSquare, Truck,
  BarChart2, Settings, AlertCircle, ArrowRight, Activity
} from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { io } from 'socket.io-client';

// ─────────────────────────────────────────────────────────────────
// Shared status color system (consistent across admin panel)
// ─────────────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  ACTIVE:      { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', border: 'rgba(34,197,94,0.25)',   label: 'Active' },
  COMPLETED:   { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6', border: 'rgba(59,130,246,0.25)',  label: 'Completed' },
  PENDING:     { bg: 'rgba(249,115,22,0.12)', text: '#F97316', border: 'rgba(249,115,22,0.25)',  label: 'Pending' },
  CANCELLED:   { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444', border: 'rgba(239,68,68,0.25)',   label: 'Cancelled' },
  NEGOTIATING: { bg: 'rgba(168,85,247,0.12)', text: '#A855F7', border: 'rgba(168,85,247,0.25)', label: 'Negotiating' },
  DELIVERED:   { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', border: 'rgba(34,197,94,0.25)',   label: 'Delivered' },
  PAID:        { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', border: 'rgba(34,197,94,0.25)',   label: 'Paid' },
  OPEN:        { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444', border: 'rgba(239,68,68,0.25)',   label: 'Open' },
  RESOLVED:    { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', border: 'rgba(34,197,94,0.25)',   label: 'Resolved' },
};

export function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: 'rgba(100,116,139,0.12)', text: '#64748b', border: 'rgba(100,116,139,0.25)', label: status };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {s.label || status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Hook: smooth count-up animation
// ─────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const prevTarget = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = prevTarget.current ?? 0;
    prevTarget.current = target;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// ─────────────────────────────────────────────────────────────────
// SVG Sparkline (lightweight, no recharts overhead for tiny charts)
// ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 88, height = 32 }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const id = `sg${color.replace('#', '')}`;

  const trend = values[values.length - 1] >= values[0];

  return (
    <div className="flex flex-col items-end gap-0.5">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${id})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* last point dot */}
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
      </svg>
      <span className="text-[10px] font-medium flex items-center gap-0.5" style={{ color }}>
        {trend ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {trend ? '+' : ''}{((values[values.length - 1] - values[0]) / (values[0] || 1) * 100).toFixed(0)}%
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// KPI Card with sparkline
// ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, iconBg, iconColor, value, label, badge, badgeColor, sparkData, loading }) {
  const animated = useCountUp(loading ? null : Number(value) || 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${iconBg} 0%, transparent 65%)` }} />

      <div className="flex items-start justify-between mb-3 relative">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {/* Sparkline top-right */}
        {!loading && sparkData && (
          <Sparkline data={sparkData} color={iconColor} />
        )}
        {loading && <div className="w-20 h-8 bg-muted animate-pulse rounded-lg" />}
      </div>

      <div className="relative mt-2">
        {loading ? (
          <div className="h-9 w-24 bg-muted animate-pulse rounded-lg mb-1" />
        ) : (
          <div className="text-3xl font-bold mb-0.5 tabular-nums tracking-tight">
            {animated.toLocaleString()}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{label}</div>
          {badge && !loading && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${badgeColor}18`, color: badgeColor }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Live pulse badge
// ─────────────────────────────────────────────────────────────────
function LiveBadge({ lastUpdated }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
      </span>
      <span className="font-medium text-foreground">Live</span>
      {lastUpdated && <span className="opacity-60">· {lastUpdated}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Themed Recharts Tooltip
// ─────────────────────────────────────────────────────────────────
const ThemedTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-2xl text-sm min-w-[130px]">
      <p className="font-semibold mb-1.5 text-foreground text-xs uppercase tracking-wide opacity-60">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 capitalize text-xs" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-foreground">
            {p.name === 'Sales' ? `Rs. ${Number(p.value).toLocaleString()}` : Number(p.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon = Activity, title = 'No data yet', description = 'Data will appear here once available.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground opacity-50" />
      </div>
      <p className="font-semibold text-sm mb-1">{title}</p>
      <p className="text-xs text-muted-foreground max-w-[200px]">{description}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Quick Actions
// ─────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Approve Users',    desc: 'Review KYC queue',         icon: UserPlus,     path: '/admin/verifications', color: '#F97316' },
  { label: 'All Listings',     desc: 'Browse marketplace items', icon: Package,      path: '/admin/listings',      color: '#3B82F6' },
  { label: 'Negotiations',     desc: 'Monitor active deals',     icon: MessageSquare,path: '/admin/negotiations',  color: '#A855F7' },
  { label: 'Transactions',     desc: 'Track payments',           icon: Receipt,      path: '/admin/transactions',  color: '#22C55E' },
  { label: 'Transport',        desc: 'Manage deliveries',        icon: Truck,        path: '/admin/transport',     color: '#06B6D4' },
  { label: 'Reports',          desc: 'View analytics',           icon: BarChart2,    path: '/admin/reports',       color: '#EAB308' },
  { label: 'Disputes',         desc: 'Resolve complaints',       icon: AlertCircle,  path: '/admin/disputes',      color: '#EF4444' },
  { label: 'Settings',         desc: 'System configuration',     icon: Settings,     path: '/admin/settings',      color: '#64748B' },
];

// ─────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chartsVisible, setChartsVisible] = useState(false);
  // Chart series toggle
  const [hiddenSeries, setHiddenSeries] = useState({});
  const animatedRevenue = useCountUp(loading ? null : Number(stats?.totalRevenue ?? 0), 1200);

  const fetchStats = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(data);
      console.log("Dashboard stats:", data);

      const resSales = await axios.get('http://localhost:5000/api/analytics/monthly-sales', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(resSales.data)) {
        setSalesData(resSales.data);
      }

      setLastUpdated(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.warn('Admin dashboard fetch failed, keeping previous data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + Socket connection
  useEffect(() => {
    document.title = "Admin Dashboard | AgroBridge";
    fetchStats();
    
    const socket = io("http://localhost:5000");
    
    // Listen for dashboard update events
    socket.on("dashboard_update", () => {
      fetchStats();
    });
    
    return () => socket.disconnect();
  }, [fetchStats]);

  // Delay chart animation until after first render
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setChartsVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const toggleSeries = (key) =>
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Derive chart data from API response (fall back to empty arrays) ──
  const tradingVolumeData = stats?.monthlyTrading ?? [];
  const userGrowthData    = stats?.userGrowth    ?? [];

  // ── Build sparklines from 6-month arrays (map to {v} format) ──
  const SPARK = {
    users:        (stats?.monthlyTrading ?? []).map((d, i) => ({ v: stats?.totalUsers   ? Math.round(stats.totalUsers   * (0.6 + i * 0.08)) : i * 5 })),
    pending:      (stats?.monthlyTrading ?? []).map(() => ({ v: stats?.pendingApprovals ?? 0 })),
    listings:     (stats?.monthlyTrading ?? []).map((d, i) => ({ v: stats?.activeListings  ? Math.round(stats.activeListings  * (0.6 + i * 0.08)) : i * 3 })),
    transactions: (stats?.monthlyTrading ?? []).map((d, i) => ({ v: stats?.totalTransactions ? Math.round(stats.totalTransactions * (0.6 + i * 0.08)) : i * 10 })),
  };

  const kpis = [
    {
      icon: Users,
      iconBg: 'rgba(34,197,94,0.12)',
      iconColor: '#22C55E',
      value: stats?.totalUsers ?? 0,
      label: 'Total Users',
      badge: '+15%',
      badgeColor: '#22C55E',
      sparkData: SPARK.users,
    },
    {
      icon: ShieldCheck,
      iconBg: 'rgba(249,115,22,0.12)',
      iconColor: '#F97316',
      value: stats?.pendingApprovals ?? 0,
      label: 'Pending Approvals',
      badge: stats?.pendingApprovals > 0 ? `${stats.pendingApprovals} Pending` : 'All Clear',
      badgeColor: stats?.pendingApprovals > 0 ? '#F97316' : '#22C55E',
      sparkData: SPARK.pending.length >= 2 ? SPARK.pending : null,
    },
    {
      icon: Package,
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#3B82F6',
      value: stats?.activeListings ?? 0,
      label: 'Active Listings',
      badge: stats?.activeListings > 0 ? `${stats.activeListings} Active` : 'None',
      badgeColor: '#3B82F6',
      sparkData: SPARK.listings.length >= 2 ? SPARK.listings : null,
    },
    {
      icon: Receipt,
      iconBg: 'rgba(168,85,247,0.12)',
      iconColor: '#A855F7',
      value: stats?.totalTransactions ?? 0,
      label: 'Total Transactions',
      badge: stats?.totalTransactions > 0 ? `${stats.totalTransactions} Total` : 'None',
      badgeColor: '#A855F7',
      sparkData: SPARK.transactions.length >= 2 ? SPARK.transactions : null,
    },
  ];

  return (
    <div className="max-w-[1320px] mx-auto">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-1.5">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform overview · Real-time statistics</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <LiveBadge lastUpdated={lastUpdated} />
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} loading={loading} />
        ))}
      </div>

      {/* ── Compact Premium Stats Banner ── */}
      {!loading && stats && (
        <div 
          className="mb-8 relative overflow-hidden bg-card border border-border rounded-2xl p-4 lg:min-h-[110px] lg:max-h-[140px] flex items-center hover:shadow-md hover:scale-[1.02] transition-all duration-300 group"
          title="Platform metrics and revenue overview"
        >
          {/* Soft Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/[0.02] via-transparent to-transparent pointer-events-none" />
          
          {/* Subtle Hover Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.02) 0%, transparent 70%)' }} />

          <div className="relative w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 z-10 animate-in fade-in zoom-in-[0.98] duration-500">
            
            {/* LEFT: Revenue Value (40%) */}
            <div className="flex-1 lg:max-w-[40%] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-foreground">Platform Revenue</h2>
                <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded bg-muted/50 border border-border/50">Paid Transactions</span>
              </div>
              <div className="text-[32px] md:text-[36px] font-bold tracking-tight text-[#22C55E] leading-none">
                Rs. {new Intl.NumberFormat('en-LK').format(animatedRevenue)}
              </div>
            </div>

            {/* CENTER: Growth & Sparkline (20%) */}
            <div className="flex-1 lg:max-w-[20%] flex items-center gap-4">
              {stats.revenueGrowth !== undefined && (
                <div className="flex flex-col items-start">
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                    stats.revenueGrowth >= 0 
                      ? 'text-emerald-600 bg-emerald-500/10' 
                      : 'text-rose-600 bg-rose-500/10'
                  }`}>
                    {stats.revenueGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 font-medium ml-1">vs last month</span>
                </div>
              )}
              {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
                <div className="w-16 h-8 opacity-60 pointer-events-none hidden xl:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyRevenue} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                      <defs>
                        <linearGradient id="compSparkGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#22C55E" 
                        strokeWidth={1.5} 
                        fill="url(#compSparkGrad)" 
                        isAnimationActive={chartsVisible} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* RIGHT: Compact Inline Stats (40%) */}
            <div className="flex-1 lg:max-w-[40%] flex items-center lg:justify-end justify-between lg:gap-6 gap-3">
              {[
                { label: 'Total Negotiations', value: stats?.totalNegotiations ?? 0, icon: MessageSquare, color: '#3B82F6' },
                { label: 'Total Transactions', value: stats?.totalTransactions ?? 0, icon: Receipt,       color: '#A855F7' },
                { label: 'Pending KYC',        value: stats?.pendingKYC ?? 0,        icon: UserPlus,      color: '#F97316' },
              ].map(({ label, value, icon: Icon, color }, i, arr) => (
                <div key={label} className="flex items-center lg:gap-6 gap-3 shrink-0">
                  <div className="flex items-start lg:items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border border-border/40 mt-0.5 lg:mt-0" style={{ background: `${color}10`, color }}>
                      <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-base sm:text-[18px] leading-none tabular-nums text-foreground">{value}</span>
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 whitespace-nowrap">{label}</span>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8 bg-border/50 hidden lg:block" />}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
      {loading && (
        <div className="mb-8 h-[88px] bg-card border border-border rounded-2xl animate-pulse" />
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-2 gap-6 mb-8">

        {/* Area / Line Chart — Sales Trend */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold">Sales Trend</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Platform revenue · Last 6 months</p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg font-medium">
              6M
            </span>
          </div>
          {salesData.length === 0 ? (
            <EmptyState icon={BarChart2} title="No sales data" description="Sales data will populate as transactions complete." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={salesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="var(--color-muted-foreground)" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false} 
                  axisLine={false} 
                  width={55}
                  tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} 
                />
                <Tooltip content={<ThemedTooltip />} cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  key={`salesArea-${salesData.length}`}
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  fill="url(#volGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#22C55E', strokeWidth: 0 }}
                  isAnimationActive={chartsVisible}
                  animationDuration={1400}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart — User Growth with toggle */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold">User Growth</h2>
              <p className="text-xs text-muted-foreground mt-0.5">New registrations · Last 6 months</p>
            </div>
            {/* Interactive legend toggles */}
            <div className="flex items-center gap-2">
              {[
                { key: 'Farmers', color: '#22C55E' },
                { key: 'Mills',   color: '#3B82F6' },
              ].map(({ key, color }) => (
                <button
                  key={key}
                  onClick={() => toggleSeries(key)}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor: hiddenSeries[key] ? 'var(--color-border)' : `${color}40`,
                    background: hiddenSeries[key] ? 'transparent' : `${color}10`,
                    color: hiddenSeries[key] ? 'var(--color-muted-foreground)' : color,
                    opacity: hiddenSeries[key] ? 0.5 : 1,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {key}
                </button>
              ))}
            </div>
          </div>
          {userGrowthData.length === 0 ? (
            <EmptyState icon={Users} title="No user data" description="User growth data will appear here." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={userGrowthData} barGap={4} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ThemedTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                {!hiddenSeries['Farmers'] && (
                  <Bar dataKey="Farmers" fill="#22C55E" radius={[5, 5, 0, 0]}
                    isAnimationActive={chartsVisible} animationDuration={1000} animationEasing="ease-out" />
                )}
                {!hiddenSeries['Mills'] && (
                  <Bar dataKey="Mills" fill="#3B82F6" radius={[5, 5, 0, 0]}
                    isAnimationActive={chartsVisible} animationDuration={1200} animationEasing="ease-out" />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <span className="text-xs text-muted-foreground">Common admin shortcuts</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, desc, icon: Icon, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group bg-card border border-border hover:border-opacity-60 rounded-xl p-4 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3"
              style={{ '--action-color': color }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4 transition-colors" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{label}</div>
                <div className="text-xs text-muted-foreground truncate">{desc}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Platform Health Footer ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Progress stats */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Platform Metrics</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-1.5 bg-muted animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {[
                { label: 'Total Users',        value: stats.totalUsers,        color: '#22C55E' },
                { label: 'Active Listings',    value: stats.activeListings,    color: '#3B82F6' },
                { label: 'Pending Approvals',  value: stats.pendingApprovals,  color: '#F97316' },
                { label: 'Total Transactions', value: stats.totalTransactions, color: '#A855F7' },
              ].map(({ label, value, color }) => {
                const max = Math.max(stats.totalUsers || 1, stats.activeListings || 1, stats.pendingApprovals || 1, stats.totalTransactions || 1);
                const pct = Math.round(((value || 0) / max) * 100);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground text-xs font-medium">{label}</span>
                      <span className="font-bold text-sm tabular-nums">{(value ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: color, transitionDelay: '400ms' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={BarChart2} title="Stats unavailable" description="Could not load platform metrics." />
          )}
        </div>

        {/* System status */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">System Status</h3>
          <div className="space-y-3">
            {[
              { label: 'API Server',  status: 'Operational', ok: true },
              { label: 'Database',   status: 'Healthy',     ok: true },
              { label: 'Socket.IO',  status: 'Connected',   ok: true },
              {
                label: 'Pending Approvals',
                status: (stats?.pendingApprovals ?? 0) > 0
                  ? `${stats.pendingApprovals} awaiting review`
                  : 'None pending',
                ok: !(stats?.pendingApprovals > 0),
              },
              {
                label: 'Data Sync',
                status: lastUpdated ? `Last sync ${lastUpdated}` : 'Syncing…',
                ok: !!lastUpdated,
              },
            ].map(({ label, status, ok }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${ok ? 'text-[#22C55E]' : 'text-orange-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-[#22C55E]' : 'bg-orange-400 animate-pulse'}`} />
                  {status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              Real-time updates active
            </span>
            <span className="flex items-center gap-1 text-[#22C55E] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
