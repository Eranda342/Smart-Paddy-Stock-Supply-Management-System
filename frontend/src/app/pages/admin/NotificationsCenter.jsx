import { useState, useEffect, useCallback } from 'react';
import { Bell, Send, Users, BellOff, CheckCircle, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const TARGETS = [
  { value: 'ALL', label: 'All Users', icon: Users, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
  { value: 'FARMER', label: 'Farmers Only', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { value: 'MILL_OWNER', label: 'Mill Owners Only', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

export default function AdminNotifications() {
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', target: 'ALL' });
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();

    const socket = io(SOCKET_URL);
    socket.on('newNotification', () => {
      fetchAnnouncements();
    });

    return () => socket.disconnect();
  }, [fetchAnnouncements]);

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSending(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/notifications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) throw new Error();

      setForm({ title: '', body: '', target: 'ALL' });
      setShowForm(false);
      toast.success(`Notification sent to ${form.target === 'ALL' ? 'all users' : form.target === 'FARMER' ? 'farmers' : 'mill owners'}!`);
      // Socket will trigger fetchAnnouncements automatically, but we can do it proactively
      fetchAnnouncements();
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(history.filter(n => n._id !== id));
      toast.success('Announcement removed');
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const targetStats = TARGETS.map(t => ({
    ...t,
    count: history.filter(n => n.target === t.value).length
  }));

  // Force ALL config count to include everyone if tracking generically
  const allStat = targetStats.find(t => t.value === 'ALL');
  if (allStat) {
     allStat.count = history.filter(n => n.target === 'ALL').length; 
  }

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Notifications Center</h1>
          <p className="text-muted-foreground">Send system-wide announcements and manage notification history</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] font-medium rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {targetStats.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.value} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${t.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-semibold ${t.color}`}>{t.count}</div>
                <div className="text-sm text-muted-foreground">{t.label} Announcements</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compose Form */}
      {showForm && (
        <div className="bg-card border border-[#22C55E]/30 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h3 className="font-semibold">Compose Announcement</h3>
              <p className="text-sm text-muted-foreground">This will appear in all matching users' notification feed</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Target selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Target Audience</label>
              <div className="flex gap-3">
                {TARGETS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm({ ...form, target: t.value })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.target === t.value
                        ? `${t.color} ${t.bg} border-current/30`
                        : 'border-border text-muted-foreground hover:border-[#22C55E]/30'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Notification title..."
                maxLength={80}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message *</label>
              <textarea
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="Write your announcement..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 resize-none transition-all"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{form.body.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] font-medium rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 bg-muted hover:bg-muted/70 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Notification History</h3>
          <span className="text-sm text-muted-foreground">{history.length} sent</span>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-40">
             <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <BellOff className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map(notif => (
              <div key={notif._id} className="flex items-start gap-4 p-5 hover:bg-muted/20 transition-colors group">
                <div className="w-10 h-10 bg-[#22C55E]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{notif.title}</h4>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      notif.target === 'ALL' ? 'text-[#22C55E] bg-[#22C55E]/10' :
                      notif.target === 'FARMER' ? 'text-blue-400 bg-blue-400/10' :
                      'text-purple-400 bg-purple-400/10'
                    }`}>
                      {notif.target}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-auto flex items-center"><CheckCircle className="w-3 h-3 text-green-400 mr-1" /> {new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notif.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3 text-primary" />
                      Delivered to {notif.count} remote users
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notif._id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
