import { useState, useEffect, useRef } from "react";
import { Search, Loader2, FileText, Users, Handshake, Package, LayoutDashboard, Truck, AlertCircle, ShieldCheck, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GlobalSearchBar({ rolePath = "/farmer" }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const allActions = [
    { title: "Dashboard", desc: "Overview and statistics", path: `${rolePath}`, icon: LayoutDashboard, color: "text-zinc-500", bg: "bg-zinc-500/10 group-hover:bg-zinc-500/20", roles: ["/farmer", "/mill-owner", "/admin"] },
    { title: "My Listings", desc: "Manage your paddy listings", path: `${rolePath}/listings`, icon: Package, color: "text-green-500", bg: "bg-green-500/10 group-hover:bg-green-500/20", roles: ["/farmer"] },
    { title: "Buy Requests", desc: "Manage purchase requests", path: `${rolePath}/listings`, icon: Package, color: "text-green-500", bg: "bg-green-500/10 group-hover:bg-green-500/20", roles: ["/mill-owner"] },
    { title: "All Listings", desc: "Manage all marketplace listings", path: `${rolePath}/listings`, icon: Package, color: "text-green-500", bg: "bg-green-500/10 group-hover:bg-green-500/20", roles: ["/admin"] },
    { title: "Browse Listings", desc: "Search marketplace", path: `${rolePath}/browse-listings`, icon: Search, color: "text-blue-500", bg: "bg-blue-500/10 group-hover:bg-blue-500/20", roles: ["/farmer", "/mill-owner"] },
    { title: "Transactions", desc: "Look up orders & payments", path: `${rolePath}/transactions`, icon: FileText, color: "text-indigo-500", bg: "bg-indigo-500/10 group-hover:bg-indigo-500/20", roles: ["/farmer", "/mill-owner", "/admin"] },
    { title: "Negotiations", desc: "Check active deals", path: `${rolePath}/negotiations`, icon: Handshake, color: "text-purple-500", bg: "bg-purple-500/10 group-hover:bg-purple-500/20", roles: ["/farmer", "/mill-owner", "/admin"] },
    { title: "Transport", desc: "Manage logistics", path: `${rolePath}/transport`, icon: Truck, color: "text-amber-500", bg: "bg-amber-500/10 group-hover:bg-amber-500/20", roles: ["/farmer", "/mill-owner", "/admin"] },
    { title: "Vehicles", desc: "Manage your vehicles for transport", path: `${rolePath}/vehicles`, icon: Truck, color: "text-amber-500", bg: "bg-amber-500/10 group-hover:bg-amber-500/20", roles: ["/mill-owner"] },
    { title: "Complaints", desc: "Report issues or view tickets", path: `${rolePath}/complaints`, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10 group-hover:bg-red-500/20", roles: ["/farmer", "/mill-owner"] },
    { title: "Disputes", desc: "Manage system disputes", path: `/admin/disputes`, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10 group-hover:bg-red-500/20", roles: ["/admin"] },
    { title: "All Users", desc: "Manage farmers & mill owners", path: `/admin/users`, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10 group-hover:bg-orange-500/20", roles: ["/admin"] },
    { title: "Pending Verifications", desc: "Pending KYC approvals", path: `/admin/verifications`, icon: ShieldCheck, color: "text-teal-500", bg: "bg-teal-500/10 group-hover:bg-teal-500/20", roles: ["/admin"] },
    { title: "System Settings", desc: "System configuration", path: `/admin/settings`, icon: Settings, color: "text-slate-500", bg: "bg-slate-500/10 group-hover:bg-slate-500/20", roles: ["/admin"] },
    { title: "Profile", desc: "My account details", path: `${rolePath}/profile`, icon: User, color: "text-sky-500", bg: "bg-sky-500/10 group-hover:bg-sky-500/20", roles: ["/farmer", "/mill-owner"] }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300); // Simulate network delay
      return () => clearTimeout(timer);
    }
  }, [query]);

  const handleAction = (path) => {
    setIsFocused(false);
    setQuery("");
    navigate(path);
  };

  const filteredActions = allActions.filter(
    (action) =>
      action.roles.includes(rolePath) &&
      (action.title.toLowerCase().includes(query.toLowerCase()) || action.desc.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md z-50">
      <div className={`relative flex items-center transition-all duration-300 ${isFocused ? "ring-4 ring-[#22c55e]/15 rounded-xl bg-card" : ""}`}>
        <Search className={`absolute left-3.5 w-4 h-4 transition-colors ${isFocused ? "text-[#22c55e]" : "text-muted-foreground"}`} />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filteredActions.length > 0) {
              handleAction(filteredActions[0].path);
            }
          }}
          placeholder="Search anything..."
          className="w-full pl-10 pr-12 py-2.5 bg-muted/80 border border-border rounded-xl focus:outline-none focus:bg-background focus:border-[#22c55e]/50 text-sm transition-all shadow-sm placeholder-muted-foreground/70"
          autoComplete="off"
        />

        <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-[#22c55e]" />}
        </div>
      </div>

      {isFocused && query && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden" 
          style={{ animation: 'slideDownFade 0.2s ease-out' }}
        >
          <div className="px-3 md:px-4 py-2 border-b border-border bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search Results</p>
          </div>
          
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
            {filteredActions.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No results found for "{query}"</p>
              </div>
            ) : (
              filteredActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button 
                    key={idx}
                    onClick={() => handleAction(action.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-left transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${action.bg}`}>
                      <Icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          {filteredActions.length > 0 && (
            <div className="bg-muted/30 p-2 md:p-3 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Press <strong>Enter</strong> to open the first result</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
