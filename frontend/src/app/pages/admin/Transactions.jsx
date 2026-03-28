import { useState, useEffect, useCallback } from 'react';
import { Search, Receipt, TrendingUp, DollarSign, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api';

const PaymentBadge = ({ status }) => {
  const map = {
    PENDING: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    PAID: 'text-green-400 bg-green-400/10 border border-green-400/20',
    FAILED: 'text-red-400 bg-red-400/10 border border-red-400/20',
  };
  const icons = { PENDING: Clock, PAID: CheckCircle, FAILED: XCircle };
  const Icon = icons[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'text-gray-400 bg-gray-400/10'}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, totalRevenue: 0 });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`${API_BASE}/admin/transactions?${params}`, { headers });
      const data = await res.json();
      setTransactions(data.transactions || []);
      if (data.stats) setStats(data.stats);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const statCards = [
    { label: 'Total Transactions', value: stats.total, icon: Receipt, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
    { label: 'Paid', value: stats.paid, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Pending Payment', value: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Total Revenue', value: `Rs ${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Transactions Management</h1>
          <p className="text-muted-foreground">Monitor all platform transactions and revenue</p>
        </div>
        <button onClick={fetchTransactions} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
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
          <option value="">All Payment Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Receipt className="w-12 h-12 mb-3 opacity-30" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Transaction ID', 'Farmer', 'Mill Owner', 'Paddy Type', 'Quantity', 'Total Amount', 'Payment', 'Transport', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-muted-foreground">#{txn._id?.slice(-8)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{txn.farmer?.fullName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{txn.farmer?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{txn.millOwner?.fullName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{txn.millOwner?.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">{txn.listing?.paddyType || '—'}</td>
                    <td className="px-4 py-4 text-sm">{txn.quantityKg ? `${txn.quantityKg} kg` : '—'}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#22C55E]">
                      {txn.totalAmount ? `Rs ${txn.totalAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-4"><PaymentBadge status={txn.paymentStatus} /></td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        txn.transportStatus === 'DELIVERED'
                          ? 'text-green-400 bg-green-400/10'
                          : txn.transportStatus === 'IN_TRANSIT'
                          ? 'text-blue-400 bg-blue-400/10'
                          : 'text-gray-400 bg-gray-400/10'
                      }`}>
                        {txn.transportStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : '—'}
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
