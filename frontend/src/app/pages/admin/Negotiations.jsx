import { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquare, RefreshCw, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
  let displayStatus = status;
  let style = 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  
  if (status === 'OPEN') {
    displayStatus = 'PENDING';
    style = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  } else if (status === 'AGREED' || status === 'ACCEPTED') {
    displayStatus = 'ACCEPTED';
    style = 'text-green-400 bg-green-400/10 border-green-400/20';
  } else if (status === 'REJECTED' || status === 'CANCELLED') {
    displayStatus = 'REJECTED';
    style = 'text-red-400 bg-red-400/10 border-red-400/20';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
      {displayStatus}
    </span>
  );
};

export default function AdminNegotiations() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);

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
                  {['Buyer', 'Seller', 'Listing', 'Offer Price (Rs)', 'Quantity', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {negotiations.map(neg => (
                  <tr key={neg._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-sm">{neg.millOwner?.fullName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{neg.millOwner?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-sm">{neg.farmer?.fullName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{neg.farmer?.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">{neg.listing?.paddyType || '—'}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#22C55E]">
                      {neg.offeredPrice ? `Rs ${neg.offeredPrice}` : '—'}
                    </td>
                    <td className="px-4 py-4 text-sm">{neg.quantity ? `${neg.quantity} kg` : '—'}</td>
                    <td className="px-4 py-4"><StatusBadge status={neg.status} /></td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {neg.updatedAt ? new Date(neg.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedNegotiation(neg)}
                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors group"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-blue-400 group-hover:text-blue-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-right">
        {negotiations.length} total negotiations
      </p>

      {/* View Modal */}
      {selectedNegotiation && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <h3 className="text-xl font-semibold">Negotiation Thread</h3>
              <button
                onClick={() => setSelectedNegotiation(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 border-b border-border shrink-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Buyer (Mill Owner)</span>
                  <span className="font-medium">{selectedNegotiation.millOwner?.fullName || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Seller (Farmer)</span>
                  <span className="font-medium">{selectedNegotiation.farmer?.fullName || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Listing</span>
                  <span className="font-medium">{selectedNegotiation.listing?.paddyType || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Quantity Requested</span>
                  <span className="font-medium">{selectedNegotiation.quantity ? `${selectedNegotiation.quantity} kg` : '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Latest Offer</span>
                  <span className="font-semibold text-[#22C55E]">
                    {selectedNegotiation.offeredPrice ? `Rs ${selectedNegotiation.offeredPrice}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Status</span>
                  <StatusBadge status={selectedNegotiation.status} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Message History ({selectedNegotiation.messages?.length || 0})
              </h4>
              {selectedNegotiation.messages && selectedNegotiation.messages.length > 0 ? (
                <div className="space-y-3">
                  {selectedNegotiation.messages.map((msg, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-full px-4 py-3 rounded-xl text-sm bg-muted/30 border border-border">
                        <div className="flex justify-between items-center mb-1">
                           <span className="font-medium text-xs text-muted-foreground">
                            {msg.senderModel === 'Farmer' ? 'Farmer' : 'Mill Owner'}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                            {msg.type || 'MESSAGE'}
                          </span>
                        </div>
                        <p className="text-foreground mt-1">{msg.message}</p>
                        {msg.offeredPrice && (
                          <div className="mt-2 text-sm font-medium text-amber-500 bg-amber-500/10 inline-block px-2 py-1 rounded">
                            Offer: Rs {msg.offeredPrice}/kg
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-8 h-8 opacity-20 mx-auto mb-2" />
                  <p>No messages in this negotiation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
