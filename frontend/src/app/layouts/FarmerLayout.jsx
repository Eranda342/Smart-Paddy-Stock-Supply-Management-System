import { useState, useEffect, useRef } from "react";
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
  HelpCircle,
  ChevronDown,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlusCircle
} from "lucide-react";

import { io } from "socket.io-client";
import toast from "react-hot-toast";
import NotificationDropdown from "../components/NotificationDropdown";
import GlobalSearchBar from "../components/GlobalSearchBar";
import { Button } from "../components/ui/button";
import { Logo } from "../components/ui/Logo";


export default function FarmerLayout() {

  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

    window.addEventListener("userUpdated", fetchUser);
    return () => window.removeEventListener("userUpdated", fetchUser);
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

        <div className="border-b border-sidebar-border">
          <Link to="/farmer" className="block px-4 py-4">
            <Logo layout="sidebar" />
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
          <Button
            variant="ghost-danger"
            onClick={handleLogout}
            className="w-full justify-start px-4 py-3 group"
          >
            <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span>Logout</span>
          </Button>
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

            <div className="flex items-center gap-3 pl-4 border-l border-border relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center gap-3 hover:bg-muted/50 p-1.5 pr-2 rounded-xl transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center font-medium text-[#0F1115] overflow-hidden">
                    {user?.profileImage ? (
                       <img src={`http://localhost:5000/uploads/${user.profileImage}`} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                       user ? getInitials(user.fullName) : "??"
                    )}
                  </div>
                  {/* Status dot */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${user?.farmDetails?.verificationStatus === 'APPROVED' ? 'bg-green-500' : user?.farmDetails?.verificationStatus === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                </div>

                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium">{user ? user.fullName : "Loading..."}</div>
                  <div className="text-xs text-muted-foreground">{user ? formatRole(user.role) : "Loading..."}</div>
                </div>
                <ChevronDown className="w-4 h-4 ml-1 text-muted-foreground hidden md:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-card border border-border rounded-xl shadow-2xl py-2 z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-muted/30">
                      {user?.farmDetails?.verificationStatus === 'APPROVED' && <><ShieldCheck className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Verified</span></>}
                      {user?.farmDetails?.verificationStatus === 'REJECTED' && <><ShieldAlert className="w-3.5 h-3.5 text-red-500" /><span className="text-red-500">Action Required</span></>}
                      {(!user?.farmDetails?.verificationStatus || user?.farmDetails?.verificationStatus === 'PENDING') && <><Clock className="w-3.5 h-3.5 text-yellow-500" /><span className="text-yellow-500">Pending</span></>}
                    </div>
                  </div>

                  <div className="py-2">
                    <button onClick={() => { setDropdownOpen(false); navigate('/farmer/listings'); }} className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors text-blue-400">
                      <PlusCircle className="w-4 h-4 mr-3" /> Create Listing
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/farmer/profile'); }} className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors">
                      <User className="w-4 h-4 mr-3" /> Profile
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/farmer'); }} className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors">
                      <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/farmer/settings'); }} className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors">
                      <Settings className="w-4 h-4 mr-3" /> Settings
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

        <main className="flex-1 w-full bg-background dark:bg-gradient-to-b dark:from-[#0B0F19] dark:to-[#0A0D16]">

          <div className="w-full px-6 md:px-10 lg:px-14 py-8">
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
}