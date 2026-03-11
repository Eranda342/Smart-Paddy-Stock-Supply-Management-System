import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Sprout, LayoutDashboard, ShieldCheck, Users, FileText, LogOut, Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/verifications', icon: ShieldCheck, label: 'Pending Verifications' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#0F1115]" />
            </div>
            <div>
              <div className="text-lg font-semibold">AgroBridge</div>
              <div className="text-xs text-muted-foreground">Admin Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  active
                    ? 'bg-[#22C55E] text-[#0F1115]'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="h-[72px] border-b border-border bg-card flex items-center justify-between px-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center relative transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#22C55E] rounded-full"></div>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center font-medium text-[#0F1115]">
                AD
              </div>
              <div>
                <div className="text-sm font-medium">Administrator</div>
                <div className="text-xs text-muted-foreground">Admin</div>
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
