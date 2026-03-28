import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sprout, LayoutDashboard, ShieldCheck, Users, FileText, LogOut,
  Search, Bell, Sun, Moon, Package, MessageSquare, Receipt, Truck,
  AlertCircle, Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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

const NavItem = ({ path, icon: Icon, label, exact = false }) => {
  const location = useLocation();
  const active = exact ? location.pathname === path : location.pathname.startsWith(path);
  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-0.5 transition-all duration-200 hover:translate-x-1 ${
        active
          ? 'bg-[#22C55E]/10 text-foreground border border-[#22c55e]/30 shadow-[0_0_12px_rgba(34,197,94,0.07)]'
          : 'text-sidebar-foreground hover:bg-sidebar-accent'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#22c55e]' : 'opacity-70'}`} />
      <span className={`text-sm font-medium ${active ? 'text-foreground' : ''}`}>{label}</span>
    </Link>
  );
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* ===== SIDEBAR ===== */}
      <div className="w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-[#0F1115]" />
            </div>
            <div>
              <div className="text-base font-semibold leading-tight">AgroBridge</div>
              <div className="text-[10px] text-muted-foreground font-medium tracking-wide">ADMIN PORTAL</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {/* Overview */}
          <SidebarSection>
            <NavItem path="/admin" icon={LayoutDashboard} label="Dashboard" exact />
          </SidebarSection>

          {/* Users */}
          <SidebarSection title="Users">
            <NavItem path="/admin/users" icon={Users} label="All Users" />
            <NavItem path="/admin/verifications" icon={ShieldCheck} label="Pending Verifications" />
          </SidebarSection>

          {/* Marketplace */}
          <SidebarSection title="Marketplace">
            <NavItem path="/admin/listings" icon={Package} label="Listings" />
            <NavItem path="/admin/negotiations" icon={MessageSquare} label="Negotiations" />
            <NavItem path="/admin/transactions" icon={Receipt} label="Transactions" />
            <NavItem path="/admin/transport" icon={Truck} label="Transport" />
          </SidebarSection>

          {/* Analytics */}
          <SidebarSection title="Analytics">
            <NavItem path="/admin/reports" icon={FileText} label="Reports & Analytics" />
          </SidebarSection>

          {/* Support */}
          <SidebarSection title="Support">
            <NavItem path="/admin/disputes" icon={AlertCircle} label="Disputes" />
            <NavItem path="/admin/notifications-center" icon={Bell} label="Notifications" />
          </SidebarSection>

          {/* Config */}
          <SidebarSection title="Configuration">
            <NavItem path="/admin/settings" icon={Settings} label="System Settings" />
          </SidebarSection>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-sm group"
          >
            <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="h-[64px] border-b border-border bg-card flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users, listings, transactions..."
                className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              <div className="w-8 h-8 bg-[#22C55E] rounded-full flex items-center justify-center font-semibold text-xs text-[#0F1115]">
                AD
              </div>
              <div>
                <div className="text-sm font-medium leading-tight">Administrator</div>
                <div className="text-[10px] text-muted-foreground">Super Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
