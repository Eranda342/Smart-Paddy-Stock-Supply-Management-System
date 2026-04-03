import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(`${API}/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotifications(data.notifications || data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io("http://localhost:5000");
    const token = localStorage.getItem("token");
    let decodedUser = null;
    
    try {
      decodedUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
    } catch (e) {
      decodedUser = null;
    }

    if (decodedUser?.id) {
      socket.emit("joinUserRoom", decodedUser.id);
    }

    socket.on("newNotification", (notification) => {
      // Re-fetch from the server so we always have well-shaped DB documents
      // (the socket payload is a minimal object without _id / read / createdAt)
      fetchNotifications();
      const msg = notification?.message || notification?.body || "New notification received";
      toast.success(`Admin Update: ${msg}`);
    });

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter(n => n && !n.read).length;

  const prevCount = useRef(0);

  useEffect(() => {
    // Only play sound if new notifications arrive (and strictly ignore initial hydrate sync to prevent loud page load noise)
    if (notifications.length > prevCount.current && prevCount.current !== 0) {
      const audio = new Audio("/notify.mp3");
      audio.play().catch(err => console.log("Browser auto-play prevented sound ring:", err));
    }
    prevCount.current = notifications.length;
  }, [notifications]);

  const formatTime = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;

    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const handleNotificationClick = async (n) => {
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

    setOpen(false);

    if (!n.read) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API}/notifications/${n._id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(notif =>
          notif._id === n._id ? { ...notif, read: true } : notif
        ));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center relative transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#22C55E] text-[#0F1115] text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 md:right-0 left-0 md:left-auto w-full md:w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl z-50 mt-3">
          <div className="sticky top-0 bg-card px-5 py-3.5 border-b border-border rounded-t-2xl flex items-center justify-between">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center font-medium">
              No notifications 🔔
            </div>
          ) : (
            notifications.filter(Boolean).slice(0, 5).map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`px-5 py-4 border-b border-border cursor-pointer transition-colors last:border-0 hover:bg-muted/40 ${
                  n.read ? "" : "font-bold bg-muted/50"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {!n.read && (
                      <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-[#22C55E]"></span>
                    )}
                    {n.read && <span className="mt-1.5 shrink-0 w-2 h-2"></span>}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-snug">{n.title || n.type?.replace('_', ' ') || "Update"}</p>
                      <p className="text-sm mt-0.5 leading-snug">{n.message}</p>
                      {n.senderName && (
                        <p className="text-xs mt-1.5 text-[#22C55E] font-medium">From: {n.senderName}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                    {formatTime(n.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
