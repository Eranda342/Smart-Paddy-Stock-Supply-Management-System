import { List } from "lucide-react";
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, LayoutDashboard, Search as SearchIcon, MessageSquare, Receipt, Truck, TruckIcon, User, LogOut, Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MillOwnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

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

    socket.on("receiveNotification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast.success(`${notification.title}: ${notification.message}`);
    });

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
    { path: '/mill-owner/browse-listings', icon: SearchIcon, label: 'Browse Listings' },
    { path: '/mill-owner/negotiations', icon: MessageSquare, label: 'Negotiations' },
    { path: '/mill-owner/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/mill-owner/transport', icon: Truck, label: 'Transport' },
    { path: '/mill-owner/vehicles', icon: TruckIcon, label: 'Vehicles' },
    { path: '/mill-owner/profile', icon: User, label: 'Profile' },
    { path: "/mill-owner/listings", icon: List, label: "Buy Requests" },
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

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#22C55E] text-[#0F1115] text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[380px] bg-card border border-border rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-y-auto">

                  <div className="sticky top-0 bg-card px-5 py-3.5 border-b border-border rounded-t-2xl flex items-center justify-between">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                    )}
                  </div>

                  {notifications.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No notifications yet
                    </div>
                  )}

                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={async () => {
                        if (n.transactionId) {
                          const token = localStorage.getItem("token");
                          const userObj = token ? JSON.parse(atob(token.split(".")[1])) : null;
                          const role = userObj?.role;
                          if (role === "FARMER") {
                            navigate(`/farmer/transactions/${n.transactionId}`);
                          } else if (role === "MILL_OWNER") {
                            navigate(`/mill-owner/transactions/${n.transactionId}`);
                          }
                        }

                        setShowNotifications(false);

                        if (!n.read) {
                          try {
                            const token = localStorage.getItem("token");
                            await fetch(`http://localhost:5000/api/notifications/${n._id}/read`, {
                              method: "PUT",
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            setNotifications(prev => prev.map(notif =>
                              notif._id === n._id ? { ...notif, read: true } : notif
                            ));
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className={`px-5 py-4 border-b border-border cursor-pointer transition-colors last:border-0 ${
                        !n.read ? "bg-[#22C55E]/5" : ""
                      } hover:bg-muted/40`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {!n.read && (
                            <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-[#22C55E]"></span>
                          )}
                          {n.read && <span className="mt-1.5 shrink-0 w-2 h-2"></span>}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm leading-snug">{n.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
                            {n.senderName && (
                              <p className="text-xs mt-1.5 text-[#22C55E] font-medium">From: {n.senderName}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                          {n.createdAt ? formatTime(n.createdAt) : ""}
                        </span>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

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
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
