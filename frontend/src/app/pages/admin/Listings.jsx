import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Trash2, CheckCircle, XCircle, Package, RefreshCw, Eye, Ban, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const API_BASE = 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: 'text-green-400 bg-green-400/10 border border-green-400/20',
    NEGOTIATING: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    CLOSED: 'text-gray-400 bg-gray-400/10 border border-gray-400/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'text-gray-400 bg-gray-400/10'}`}>
      {status}
    </span>
  );
};

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, open: 0, sold: 0 });
  const [selectedListing, setSelectedListing] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (districtFilter) params.set('district', districtFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${API_BASE}/admin/listings?${params}`, { headers });
      const data = await res.json();
      const list = data.listings || [];
      setListings(list);
      setStats({
        total: list.length,
        open: list.filter(l => l.status === 'ACTIVE').length,
        sold: list.filter(l => l.status === 'CLOSED').length,
      });
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [search, districtFilter, statusFilter]);

  useEffect(() => { 
    fetchListings(); 
    socket.on("dashboard_update", fetchListings);
    return () => socket.off("dashboard_update", fetchListings);
  }, [fetchListings]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/listings/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      toast.success('Listing deleted');
      fetchListings();
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/admin/listings/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
      toast.success(`Listing status updated to ${status}`);
      fetchListings();
    } catch {
      toast.error('Failed to update listing status');
    }
  };

  const districts = ['Anuradhapura', 'Polonnaruwa', 'Kurunegala', 'Ratnapura', 'Colombo', 'Kandy', 'Gampaha', 'Galle', 'Matara', 'Hambantota'];

  return (
    <div className="max-w-[1320px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Listings Management</h1>
          <p className="text-muted-foreground">Monitor and manage all farmer listings</p>
        </div>
        <button onClick={fetchListings} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Listings', value: stats.total, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
          { label: 'Active (Open)', value: stats.open, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Sold / Closed', value: stats.sold, color: 'text-gray-400', bg: 'bg-gray-400/10' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
              <Package className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by paddy type or description..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
          />
        </div>
        <select
          value={districtFilter}
          onChange={e => setDistrictFilter(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
        >
          <option value="">All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
        >
                  <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="NEGOTIATING">Negotiating</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p>No listings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Farmer', 'Paddy Type', 'Quantity (kg)', 'Price / kg', 'District', 'Status', 'Posted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-sm">{listing.owner?.fullName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{listing.owner?.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">{listing.paddyType || '—'}</td>
                    <td className="px-4 py-4 text-sm">{listing.quantityKg?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-4 text-sm">Rs {listing.pricePerKg || '—'}</td>
                    <td className="px-4 py-4 text-sm">{listing.location?.district || '—'}</td>
                    <td className="px-4 py-4"><StatusBadge status={listing.status} /></td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedListing(listing)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-blue-400 group-hover:text-blue-500" />
                        </button>
                        {listing.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusUpdate(listing._id, 'CLOSED')}
                            className="p-2 hover:bg-yellow-500/10 rounded-lg transition-colors group"
                            title="Suspend Listing"
                          >
                            <Ban className="w-4 h-4 text-yellow-400 group-hover:text-yellow-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(listing._id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold">Listing Details</h3>
              <button
                onClick={() => setSelectedListing(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Listing ID</span>
                <span className="font-medium">{selectedListing._id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Farmer Name</span>
                <span className="font-medium">{selectedListing.owner?.fullName || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Paddy Type</span>
                <span className="font-medium">{selectedListing.paddyType || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{selectedListing.quantityKg?.toLocaleString() || '—'} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price per kg</span>
                <span className="font-medium">Rs {selectedListing.pricePerKg || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">District</span>
                <span className="font-medium">{selectedListing.location?.district || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">{selectedListing.owner?.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selectedListing.status} />
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedListing(null)}
                className="px-6 py-2.5 bg-muted hover:bg-muted/70 text-foreground font-medium rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
