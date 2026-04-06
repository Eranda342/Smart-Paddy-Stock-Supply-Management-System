import { List } from "lucide-react";
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, LayoutDashboard, Search as SearchIcon, MessageSquare, Receipt, Truck, TruckIcon, User, LogOut, Search, Bell, HelpCircle } from 'lucide-react';
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import NotificationDropdown from "../components/NotificationDropdown";
import GlobalSearchBar from "../components/GlobalSearchBar";

export default function MillOwnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const localUser = localStorage.getItem("user");
        if (localUser) setUser(JSON.parse(localUser));
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    const token = localStorage.getItem("token");
    let decodedUser = null;
    try {
      decodedUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
    } catch (e) {
      decodedUser = null;
    }

    if (decodedUser?.id) {
      socket.emit("registerUser", decodedUser.id);
    }

    return () => socket.disconnect();
  }, []);

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return "";
    return role.split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const menuItems = [
    { path: '/mill-owner', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: "/mill-owner/listings", icon: List, label: "Buy Requests" },
    { path: '/mill-owner/browse-listings', icon: SearchIcon, label: 'Browse Listings' },
    { path: '/mill-owner/negotiations', icon: MessageSquare, label: 'Negotiations' },
    { path: '/mill-owner/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/mill-owner/vehicles', icon: TruckIcon, label: 'Vehicles' },
    { path: '/mill-owner/transport', icon: Truck, label: 'Transport' },
    { path: '/mill-owner/complaints', icon: HelpCircle, label: 'Complaints' },
    { path: '/mill-owner/profile', icon: User, label: 'Profile' },
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/mill-owner" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#0F1115]" />
            </div>
            <div>
              <div className="text-lg font-semibold">AgroBridge</div>
              <div className="text-xs text-muted-foreground">Mill Owner Portal</div>
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
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg mb-1 group transition-all duration-200 hover:translate-x-1 ${
                  active
                    ? 'bg-[#22C55E]/10 text-foreground border border-[#22c55e]/30 shadow-[0_0_15px_rgba(34,197,94,0.08)]'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors duration-300 z-10 ${active ? 'text-[#22c55e]' : ''}`} />
                <span className={`font-medium z-10 ${active ? 'text-foreground' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-transparent transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <div className="h-[72px] border-b border-border bg-card flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex-1 max-w-md flex items-center pr-4">
            <GlobalSearchBar rolePath="/mill-owner" />
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center font-medium text-[#0F1115]">
                {user ? getInitials(user.fullName) : "??"}
              </div>
              <div>
                <div className="text-sm font-medium">{user ? user.fullName : "Loading..."}</div>
                <div className="text-xs text-muted-foreground">{user ? formatRole(user.role) : "Loading..."}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 w-full bg-background dark:bg-gradient-to-b dark:from-[#0B0F19] dark:to-[#0A0D16]">
          <div className="w-full px-6 md:px-10 lg:px-14 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
