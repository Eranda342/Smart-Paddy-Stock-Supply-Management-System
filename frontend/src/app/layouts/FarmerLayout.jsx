import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sprout,
  LayoutDashboard,
  Package,
  Handshake,
  Truck,
  User,
  LogOut,
  Search,
  Bell,
  HelpCircle
} from "lucide-react";

import { io } from "socket.io-client";
import toast from "react-hot-toast";
import NotificationDropdown from "../components/NotificationDropdown";
import GlobalSearchBar from "../components/GlobalSearchBar";

export default function FarmerLayout() {

  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        // Initial fallback to local storage for speed
        const localUser = localStorage.getItem("user");
        if (localUser) setUser(JSON.parse(localUser));

        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user)); // Update local cache
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };
    fetchUser();
  }, []);

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return "";
    return role.split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const menuItems = [
    { name: "Dashboard", path: "/farmer", icon: LayoutDashboard },
    { name: "My Listings", path: "/farmer/listings", icon: Package },
    { name: "Browse Listings", path: "/farmer/browse-listings", icon: Search },
    { name: "Negotiations", path: "/farmer/negotiations", icon: Handshake },
    { name: "Transactions", path: "/farmer/transactions", icon: Package },
    { name: "Transport", path: "/farmer/transport", icon: Truck },
    { name: "Complaints", path: "/farmer/complaints", icon: HelpCircle },
    { name: "Profile", path: "/farmer/profile", icon: User }
  ];

  const isActive = (path) => {

    if (path === "/farmer") {
      return location.pathname === "/farmer";
    }

    return location.pathname.startsWith(path);

  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}

      <div className="w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 sticky top-0 h-screen">

        <div className="p-6 border-b border-sidebar-border">

          <Link to="/farmer" className="flex items-center gap-3">

            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#0F1115]" />
            </div>

            <div>
              <div className="text-lg font-semibold">AgroBridge</div>
              <div className="text-xs text-muted-foreground">
                Farmer Portal
              </div>
            </div>

          </Link>

        </div>

        <nav className="flex-1 p-4">

          {menuItems.map((item) => {

            const Icon = item.icon;
            const active = isActive(item.path);

            return (

              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 group transition-all duration-200 hover:translate-x-1 ${
                  active
                    ? "bg-[#22C55E]/10 text-foreground border border-[#22c55e]/30 shadow-[0_0_15px_rgba(34,197,94,0.08)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >

                <Icon className={`w-5 h-5 transition-colors duration-300 ${active ? 'text-[#22c55e]' : ''}`} />
                <span className={`font-medium ${active ? 'text-foreground' : ''}`}>{item.name}</span>

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

      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navbar */}

        <div className="h-[72px] border-b border-border bg-card flex items-center justify-between px-8 sticky top-0 z-40">

          <div className="flex-1 max-w-md flex items-center pr-4">
            <GlobalSearchBar rolePath="/farmer" />
          </div>

          <div className="flex items-center gap-4">

            <NotificationDropdown />

            <div className="flex items-center gap-3 pl-4 border-l border-border">

              <div className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center font-medium text-[#0F1115]">
                {user ? getInitials(user.fullName) : "..."}
              </div>

              <div>
                <div className="text-sm font-medium">
                  {user ? user.fullName : "Loading..."}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user ? formatRole(user.role) : "Loading..."}
                </div>
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