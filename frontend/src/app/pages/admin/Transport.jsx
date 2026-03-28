import { useState, useEffect, useCallback } from 'react';
import { Search, Truck, RefreshCw, MapPin, CheckCircle, Clock, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api';

const TransportBadge = ({ status }) => {
  const map = {
    PENDING: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    VEHICLE_ASSIGNED: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    IN_TRANSIT: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
    DELIVERED: 'text-green-400 bg-green-400/10 border border-green-400/20',
    PICKUP_CONFIRMED: 'text-indigo-400 bg-indigo-400/10 border border-indigo-400/20',
  };
  const icons = {
    PENDING: Clock,
    VEHICLE_ASSIGNED: Package,
    IN_TRANSIT: Truck,
    DELIVERED: CheckCircle,
    PICKUP_CONFIRMED: MapPin,
  };
  const Icon = icons[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'text-gray-400 bg-gray-400/10'}`}>
      <Icon className="w-3 h-3" />
      {(status || 'N/A').replace(/_/g, ' ')}
    </span>
  );
};

export default function AdminTransport() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, delivered: 0, inTransit: 0, pending: 0 });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTransport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('transportStatus', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`${API_BASE}/admin/transport?${params}`, { headers });
      const data = await res.json();
      const list = data.transports || [];
      setTransports(list);
      setStats({
        total: list.length,
        delivered: list.filter(t => t.transportStatus === 'DELIVERED').length,
        inTransit: list.filter(t => t.transportStatus === 'IN_TRANSIT').length,
        pending: list.filter(t => !t.transportStatus || t.transportStatus === 'PENDING').length,
      });
    } catch {
      toast.error('Failed to load transport data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchTransport(); }, [fetchTransport]);

  const statCards = [
    { label: 'Total Deliveries', value: stats.total, icon: Truck, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'In Transit', value: stats.inTransit, icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Transport Management</h1>
          <p className="text-muted-foreground">Track all platform deliveries and logistics</p>
        </div>
        <button onClick={fetchTransport} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className={`text-2xl font-semibold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by farmer or mill owner..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VEHICLE_ASSIGNED">Vehicle Assigned</option>
          <option value="PICKUP_CONFIRMED">Pickup Confirmed</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Truck className="w-12 h-12 mb-3 opacity-30" />
            <p>No transport records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Txn ID', 'Farmer', 'Mill Owner', 'Paddy Type', 'Quantity', 'Vehicle', 'Transport Status', 'Payment', 'Last Updated'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transports.map(txn => (
                  <tr key={txn._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-muted-foreground">#{txn._id?.slice(-8)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{txn.farmer?.fullName || '—'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{txn.millOwner?.fullName || '—'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">{txn.listing?.paddyType || '—'}</td>
                    <td className="px-4 py-4 text-sm">{txn.quantityKg ? `${txn.quantityKg} kg` : '—'}</td>
                    <td className="px-4 py-4">
                      {txn.vehicle ? (
                        <div>
                          <div className="text-sm font-medium">{txn.vehicle.plateNumber || txn.vehicle.vehiclePlate}</div>
                          <div className="text-xs text-muted-foreground">{txn.vehicle.driverName || txn.vehicle.type}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4"><TransportBadge status={txn.transportStatus} /></td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        txn.paymentStatus === 'PAID'
                          ? 'text-green-400 bg-green-400/10'
                          : 'text-amber-400 bg-amber-400/10'
                      }`}>
                        {txn.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {txn.updatedAt ? new Date(txn.updatedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
