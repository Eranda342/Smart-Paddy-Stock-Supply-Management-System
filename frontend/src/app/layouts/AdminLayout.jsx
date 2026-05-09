import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout, LayoutDashboard, ShieldCheck, Users, FileText, LogOut,
  Search, Bell, Package, MessageSquare, Receipt, Truck,
  AlertCircle, Settings, CheckCheck, X, RefreshCw, Info, ChevronDown, User, Menu
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlobalSearchBar from '../components/GlobalSearchBar';
import { Button } from '../components/ui/button';
import { Logo } from "../components/ui/Logo";
import { API_BASE_URL } from "@/api/api";
import { socket, disconnectSocket } from "@/socket";


// ─────────────────────────────────────────────────────────────────
// Sidebar helpers
// ─────────────────────────────────────────────────────────────────
const SidebarSection = ({ title, children }) => (
  <div className="mb-1">
    {title && (
      <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {title}
      </p>
    )}
    {children}
  </div>
);

const NavItem = ({ path, icon: Icon, label, badge, exact = false }) => {
  const location = useLocation();
  const active = exact ? location.pathname === path : location.pathname.startsWith(path);
  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-0.5 transition-all duration-200 hover:translate-x-1 ${active
          ? 'bg-[#22C55E]/10 text-foreground border border-[#22c55e]/30 shadow-[0_0_12px_rgba(34,197,94,0.07)]'
          : 'text-sidebar-foreground hover:bg-sidebar-accent'
        }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#22c55e]' : 'opacity-70'}`} />
      <span className={`text-sm font-medium flex-1 ${active ? 'text-foreground' : ''}`}>{label}</span>
      {badge > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white min-w-[18px] text-center leading-tight">
          {badge}
        </span>
      )}
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────
// Notification types → icons + colors
// ─────────────────────────────────────────────────────────────────
const NOTIF_ICONS = {
  kyc: { icon: ShieldCheck, color: '#F97316' },
  listing: { icon: Package, color: '#3B82F6' },
  transaction: { icon: Receipt, color: '#A855F7' },
  dispute: { icon: AlertCircle, color: '#EF4444' },
  system: { icon: Info, color: '#22C55E' },
};

function NotifIcon({ type }) {
  const { icon: Icon, color } = NOTIF_ICONS[type] || NOTIF_ICONS.system;
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `${color}18` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Notification Dropdown
// ─────────────────────────────────────────────────────────────────
function NotificationDropdown({ onClose, pendingKyc }) {
  const navigate = useNavigate();
  const ref = useRef(null);

  // Build system notifications from platform state
  const notifications = [
    pendingKyc > 0 && {
      id: 'kyc-pending',
      type: 'kyc',
      title: `${pendingKyc} user${pendingKyc > 1 ? 's' : ''} pending verification`,
      desc: 'Review and approve KYC submissions',
      time: 'Just now',
      action: '/admin/verifications',
      unread: true,
    },
    {
      id: 'sys-live',
      type: 'system',
      title: 'Dashboard is live',
      desc: 'Real-time stats are auto-refreshing every 30s',
      time: '1m ago',
      unread: false,
    },
    {
      id: 'listing-new',
      type: 'listing',
      title: 'New listings posted today',
      desc: 'Monitor active marketplace items',
      time: '5m ago',
      action: '/admin/listings',
      unread: true,
    },
    {
      id: 'dispute-open',
      type: 'dispute',
      title: 'Open disputes require attention',
      desc: 'Review and resolve pending complaints',
      time: '12m ago',
      action: '/admin/disputes',
      unread: false,
    },
  ].filter(Boolean);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Click-outside close
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleClick = (notif) => {
    if (notif.action) { navigate(notif.action); onClose(); }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[360px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
      style={{ animation: 'slideDownFade 0.18s ease-out' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#22C55E] text-[#0F1115] leading-tight">
              {unreadCount} new
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="w-7 h-7">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </div>

      {/* Notification list */}
      <div className="max-h-[340px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <CheckCheck className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs opacity-60">No new notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${n.action ? 'cursor-pointer' : 'cursor-default'
                }`}
            >
              <NotifIcon type={n.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium leading-tight ${n.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {n.title}
                  </p>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.desc}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-muted/30">
        <button
          onClick={() => { navigate('/admin/notifications-center'); onClose(); }}
          className="w-full text-xs text-center text-[#22C55E] hover:text-[#16A34A] font-semibold transition-colors py-0.5"
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Admin Layout
// ─────────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingKyc, setPendingKyc] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Click-outside closes admin profile dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch platform stats (for KYC badge)
  const fetchPendingKyc = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPendingKyc(data.pendingVerifications ?? 0);
      setStatsLoaded(true);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchPendingKyc();
    const interval = setInterval(fetchPendingKyc, 30_000);
    return () => clearInterval(interval);
  }, [fetchPendingKyc]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    navigate('/login');
  };

  const totalUnread = pendingKyc > 0 ? 1 : 0; // plus any other sources

  return (
    <>
      {/* Inject animation keyframe */}
      <style>{`
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex min-h-screen bg-background">

        {/* ═══ SIDEBAR CONTENT ═══ */}
        {(() => {
          const SidebarContent = () => (
            <>
              {/* Logo */}
              <div className="border-b border-sidebar-border relative shrink-0">
                <Link to="/admin" className="block px-4 py-4">
                  <Logo layout="sidebar" />
                </Link>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-4 top-4 lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 p-3 overflow-y-auto">
                <SidebarSection>
                  <NavItem path="/admin" icon={LayoutDashboard} label="Dashboard" exact />
                </SidebarSection>

                <SidebarSection title="Users">
                  <NavItem path="/admin/users" icon={Users} label="All Users" />
                  <NavItem path="/admin/verifications" icon={ShieldCheck} label="Pending Verifications" badge={pendingKyc} />
                </SidebarSection>

                <SidebarSection title="Marketplace">
                  <NavItem path="/admin/listings" icon={Package} label="Listings" />
                  <NavItem path="/admin/negotiations" icon={MessageSquare} label="Negotiations" />
                  <NavItem path="/admin/transactions" icon={Receipt} label="Transactions" />
                  <NavItem path="/admin/transport" icon={Truck} label="Transport" />
                </SidebarSection>

                <SidebarSection title="Analytics">
                  <NavItem path="/admin/reports" icon={FileText} label="Reports & Analytics" />
                </SidebarSection>

                <SidebarSection title="Support">
                  <NavItem path="/admin/disputes" icon={AlertCircle} label="Disputes" />
                  <NavItem path="/admin/notifications-center" icon={Bell} label="Notifications" />
                </SidebarSection>

                <SidebarSection title="Configuration">
                  <NavItem path="/admin/settings" icon={Settings} label="System Settings" />
                </SidebarSection>
              </nav>

              {/* Logout */}
              <div className="p-3 border-t border-sidebar-border shrink-0">
                <Button
                  variant="ghost-danger"
                  onClick={handleLogout}
                  className="w-full justify-start px-4 py-2.5 text-sm group"
                >
                  <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span>Logout</span>
                </Button>
              </div>
            </>
          );

          return (
            <>
              {/* Desktop Sidebar */}
              <div className="hidden lg:flex w-[260px] bg-sidebar border-r border-sidebar-border flex-col shrink-0 sticky top-0 h-screen">
                {SidebarContent()}
              </div>

              {/* Mobile Drawer Overlay */}
              <AnimatePresence>
                {mobileOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setMobileOpen(false)}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
                    />
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="fixed inset-y-0 left-0 w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col z-[60] lg:hidden shadow-2xl"
                    >
                      {SidebarContent()}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          );
        })()}

        {/* ═══ MAIN CONTENT ═══ */}
          {/* Logo */}
        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top Navbar */}
          <div className="h-[64px] border-b border-border bg-card flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-40">

            {/* Search */}
            <div className="flex-1 max-w-md flex items-center pr-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden mr-3 p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <GlobalSearchBar rolePath="/admin" />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">

              {/* Notification Bell */}
              <div className="relative">
                <Button
                  id="admin-notifications-btn"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications((v) => !v)}
                  className={`relative ${showNotifications ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-muted hover:bg-muted/70'
                    }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {totalUnread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                      {totalUnread}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <NotificationDropdown
                    onClose={() => setShowNotifications(false)}
                    pendingKyc={pendingKyc}
                  />
                )}
              </div>

              {/* Admin profile dropdown */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-border ml-1 relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 hover:bg-muted/50 p-1.5 pr-2 rounded-xl transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-[#0F1115] shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}>
                      AD
                    </div>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-card" />
                  </div>
                  {/* Text */}
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold leading-tight">Administrator</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold px-1.5 py-px rounded-sm uppercase tracking-wider"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                        Super Admin
                      </span>
                      {statsLoaded && (
                        <span className="text-[9px] text-muted-foreground/60">· {pendingKyc > 0 ? `${pendingKyc} pending` : 'All clear'}</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-1 text-muted-foreground hidden md:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-card border border-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold">Administrator</p>
                      <p className="text-xs text-muted-foreground">Super Admin</p>
                    </div>

                    <div className="py-2">
                      <button onClick={() => { setDropdownOpen(false); navigate('/admin'); }} className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors">
                        <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                      </button>
                      <button onClick={() => { setDropdownOpen(false); navigate('/admin/settings'); }} className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors">
                        <Settings className="w-4 h-4 mr-3" /> System Settings
                      </button>
                      <button onClick={() => { setDropdownOpen(false); navigate('/admin/profile'); }} className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors">
                        <User className="w-4 h-4 mr-3" /> Profile
                      </button>
                    </div>

                    <div className="border-t border-border py-2">
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4 mr-3" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1">
            <div className="p-3 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
