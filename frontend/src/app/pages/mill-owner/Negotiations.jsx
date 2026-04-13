import { useState, useEffect, useMemo } from "react";
import { MessageSquare } from "lucide-react";
import {
  socket,
  ConversationItem,
  DealCard,
} from "../../components/negotiations/index.jsx";

const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=22C55E&color=fff";
const BASE_URL = "http://localhost:5000";

export default function MillOwnerNegotiations() {
  const [allNegotiations, setAllNegotiations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsersMap, setOnlineUsersMap] = useState({});

  const token = localStorage.getItem("token");
  const decodedUser = token ? JSON.parse(atob(token.split(".")[1])) : null;

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchNegotiations = async () => {
    if (allNegotiations.length === 0) setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/negotiations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const filtered = data.negotiations.filter(n => n.farmer);
        setAllNegotiations(filtered);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  // ── Socket setup ───────────────────────────────────────────────────────────

  useEffect(() => {
    document.title = "Negotiations | AgroBridge";

    const register = () => { if (decodedUser) socket.emit("registerUser", decodedUser.id); };
    if (socket.connected) register();
    socket.on("connect", register);
    socket.on("userOnline",  id => setOnlineUsersMap(p => ({ ...p, [id]: true })));
    socket.on("userOffline", id => setOnlineUsersMap(p => ({ ...p, [id]: false })));

    // All real-time events that should refresh the list
    const refresh = () => fetchNegotiations();
    ["dashboard_update", "receiveMessage", "receiveStatusUpdate", "messagesRead", "messageDeleted", "messageEdited"]
      .forEach(ev => socket.on(ev, refresh));

    fetchNegotiations();

    return () => {
      socket.off("connect", register);
      socket.off("userOnline"); socket.off("userOffline");
      ["dashboard_update", "receiveMessage", "receiveStatusUpdate", "messagesRead", "messageDeleted", "messageEdited"]
        .forEach(ev => socket.off(ev, refresh));
    };
  }, []);

  // ── Group by farmer ────────────────────────────────────────────────────────

  const userGroups = useMemo(() => {
    const map = new Map();
    allNegotiations.forEach(n => {
      const farmerId = n.farmer?._id || n.farmer;
      if (!farmerId) return;
      if (!map.has(farmerId)) {
        map.set(farmerId, {
          user: n.farmer, userId: farmerId,
          latestUpdatedAt: new Date(n.updatedAt),
          unreadCount: n.unreadCountMillOwner || 0,
          listings: [n],
        });
      } else {
        const g = map.get(farmerId);
        g.listings.push(n);
        if (new Date(n.updatedAt) > g.latestUpdatedAt) g.latestUpdatedAt = new Date(n.updatedAt);
        g.unreadCount += (n.unreadCountMillOwner || 0);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.latestUpdatedAt - a.latestUpdatedAt);
  }, [allNegotiations]);

  // Auto-select first group
  useEffect(() => {
    if (!selectedUserId && userGroups.length > 0) {
      setSelectedUserId(userGroups[0].userId);
    }
  }, [userGroups]);

  // Check online status on selection
  useEffect(() => {
    if (selectedUserId) socket.emit("checkOnlineStatus", selectedUserId);
  }, [selectedUserId]);

  const selectedGroup = userGroups.find(g => g.userId === selectedUserId);

  // Determine the "active deal" (most recently updated OPEN listing)
  const activeDealId = useMemo(() => {
    if (!selectedGroup) return null;
    const openDeals = selectedGroup.listings.filter(n => n.status === "OPEN");
    if (openDeals.length === 0) return selectedGroup.listings[0]?._id;
    return openDeals.reduce((a, b) => new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b)._id;
  }, [selectedGroup]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Grower Negotiations</h1>
        <p className="text-muted-foreground text-sm">
          Manage counter-offers and deals across multiple paddy listings, grouped by farmer.
        </p>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-5 h-[calc(100vh-240px)]">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="bg-card border border-border/60 rounded-2xl flex flex-col overflow-hidden shadow-md">
          {/* Fixed header */}
          <div className="px-4 py-3.5 border-b border-border/60 bg-[#0f1319] shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Conversations</h2>
              <span className="text-[10px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
                {userGroups.length} farmer{userGroups.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Loading…
              </div>
            ) : userGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              userGroups.map(grp => (
                <ConversationItem
                  key={grp.userId}
                  grp={grp}
                  isSelected={selectedUserId === grp.userId}
                  onClick={() => setSelectedUserId(grp.userId)}
                  role="millowner"
                />
              ))
            )}
          </div>
        </div>

        {/* ── Chat Panel ───────────────────────────────────────────────────── */}
        <div className="bg-card border border-border/60 rounded-2xl flex flex-col overflow-hidden shadow-md min-h-0">
          {selectedGroup ? (
            <>
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-border/60 bg-[#0f1319] shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#22C55E]/15 border border-[#22C55E]/20 shrink-0">
                    <img
                      src={
                        selectedGroup.user?.profileImage
                          ? `${BASE_URL}/uploads/${selectedGroup.user.profileImage}`
                          : defaultAvatar
                      }
                      onError={(e) => { e.target.src = defaultAvatar; }}
                      className="w-full h-full object-cover"
                      alt="Farmer"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {selectedGroup.user?.fullName || selectedGroup.user?.email || "Farmer"}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {onlineUsersMap[selectedGroup.userId] ? (
                        <span className="text-[11px] text-[#22C55E] flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" /> Online
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Offline</span>
                      )}
                      <span className="text-muted-foreground/40 text-[11px]">•</span>
                      <span className="text-[11px] text-muted-foreground">
                        {selectedGroup.listings.length} listing{selectedGroup.listings.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal cards — scrollable */}
              <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
                {/* Sort: OPEN first, then by updatedAt desc */}
                {[...selectedGroup.listings]
                  .sort((a, b) => {
                    if (a.status === "OPEN" && b.status !== "OPEN") return -1;
                    if (b.status === "OPEN" && a.status !== "OPEN") return 1;
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                  })
                  .map(neg => (
                    <DealCard
                      key={neg._id}
                      neg={neg}
                      decodedUser={decodedUser}
                      token={token}
                      fetchNegotiations={fetchNegotiations}
                      defaultExpanded={neg._id === activeDealId}
                      isActive={neg._id === activeDealId}
                      roleName="farmer"
                    />
                  ))
                }
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
              <MessageSquare className="w-12 h-12 text-muted-foreground/20" />
              <div>
                <p className="font-medium text-muted-foreground">Select a conversation</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {loading ? "Loading conversations…" : "Choose a farmer from the sidebar to start negotiating"}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
