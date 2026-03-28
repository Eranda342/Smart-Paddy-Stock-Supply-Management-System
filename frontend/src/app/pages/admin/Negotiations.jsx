import { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquare, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
  const map = {
    OPEN: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    AGREED: 'text-green-400 bg-green-400/10 border border-green-400/20',
    ACCEPTED: 'text-green-400 bg-green-400/10 border border-green-400/20',
    REJECTED: 'text-red-400 bg-red-400/10 border border-red-400/20',
    CANCELLED: 'text-gray-400 bg-gray-400/10 border border-gray-400/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'text-gray-400 bg-gray-400/10'}`}>
      {status}
    </span>
  );
};

function NegotiationRow({ neg }) {
  const [expanded, setExpanded] = useState(false);
  const msgCount = neg.messages?.length || 0;

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-4">
          <div className="font-medium text-sm">{neg.farmer?.fullName || '—'}</div>
          <div className="text-xs text-muted-foreground">{neg.farmer?.email}</div>
        </td>
        <td className="px-4 py-4">
          <div className="font-medium text-sm">{neg.millOwner?.fullName || '—'}</div>
          <div className="text-xs text-muted-foreground">{neg.millOwner?.email}</div>
        </td>
        <td className="px-4 py-4 text-sm">{neg.listing?.paddyType || '—'}</td>
        <td className="px-4 py-4 text-sm">
          {neg.offeredPrice ? `Rs ${neg.offeredPrice}/kg` : '—'}
        </td>
        <td className="px-4 py-4 text-sm">{neg.quantity ? `${neg.quantity} kg` : '—'}</td>
        <td className="px-4 py-4"><StatusBadge status={neg.status} /></td>
        <td className="px-4 py-4">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            {msgCount}
          </span>
        </td>
        <td className="px-4 py-4 text-sm text-muted-foreground">
          {neg.updatedAt ? new Date(neg.updatedAt).toLocaleDateString() : '—'}
        </td>
        <td className="px-4 py-4">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </td>
      </tr>
      {expanded && msgCount > 0 && (
        <tr className="bg-muted/20 border-b border-border">
          <td colSpan={9} className="px-6 py-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Message Thread ({msgCount} messages)
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {neg.messages.map((msg, i) => (
                <div key={i} className="flex gap-2">
                  <div className={`max-w-sm px-3 py-2 rounded-xl text-sm bg-muted/50 border border-border`}>
                    <span className="font-medium text-xs text-muted-foreground block mb-0.5">
                      {msg.type || 'MESSAGE'}
                    </span>
                    {msg.message}
                    {msg.offeredPrice && (
                      <span className="block text-xs text-amber-400 mt-1">Offer: Rs {msg.offeredPrice}/kg</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminNegotiations() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNegotiations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`${API_BASE}/admin/negotiations?${params}`, { headers });
      const data = await res.json();
      setNegotiations(data.negotiations || []);
    } catch {
      toast.error('Failed to load negotiations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchNegotiations(); }, [fetchNegotiations]);

  const statuses = ['OPEN', 'AGREED', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Negotiations Monitor</h1>
          <p className="text-muted-foreground">View all active and historical negotiations</p>
        </div>
        <button onClick={fetchNegotiations} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {statuses.map(s => {
          const cnt = negotiations.filter(n => n.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                statusFilter === s
                  ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
                  : 'bg-card border-border text-muted-foreground hover:border-[#22C55E]/30'
              }`}
            >
              {s} <span className="ml-1 opacity-70">({cnt})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by farmer or mill owner name..."
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : negotiations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p>No negotiations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Farmer', 'Mill Owner', 'Paddy Type', 'Offered Price', 'Quantity', 'Status', 'Messages', 'Last Activity', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {negotiations.map(neg => <NegotiationRow key={neg._id} neg={neg} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-right">
        Click any row to expand message thread •  {negotiations.length} total
      </p>
    </div>
  );
}
