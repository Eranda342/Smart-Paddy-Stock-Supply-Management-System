import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, CheckCircle, XCircle, Eye, User,
  ShieldCheck, ShieldX, Clock, FileText, Tractor, Building2,
  X, AlertTriangle, Phone, Mail, Hash, MapPin, Layers, Calendar, Ban, Trash2
} from 'lucide-react';

const API = 'http://localhost:5000/api/admin';

// ─── helpers ─────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Badges ─────────────────────────────────────────────────────────────
function StatusBadge({ user }) {
  if (user.isBlocked) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border text-gray-400 bg-gray-400/10 border-gray-400/25">
        <Ban className="w-3 h-3" /> Blocked
      </span>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border text-emerald-400 bg-emerald-400/10 border-emerald-400/25">
        <ShieldCheck className="w-3 h-3" /> System
      </span>
    );
  }

  const vstatus = user.role === 'FARMER' ? user.farmDetails?.verificationStatus : user.businessDetails?.verificationStatus;
  
  const map = {
    PENDING:  { cls: 'text-amber-400  bg-amber-400/10  border-amber-400/25',  icon: Clock,        label: 'Pending' },
    APPROVED: { cls: 'text-green-400  bg-green-400/10  border-green-400/25',  icon: ShieldCheck,  label: 'Approved' },
    REJECTED: { cls: 'text-red-400    bg-red-400/10    border-red-400/25',    icon: ShieldX,      label: 'Rejected' },
  };
  
  const s = map[vstatus] || map.PENDING;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

function RoleBadge({ role }) {
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border text-purple-400 bg-purple-400/10 border-purple-400/25">
        <ShieldCheck className="w-3 h-3" /> Administrator
      </span>
    );
  }

  const isFarmer = role === 'FARMER';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
      isFarmer
        ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25'
        : 'text-blue-400   bg-blue-400/10   border-blue-400/25'
    }`}>
      {isFarmer ? <Tractor className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
      {isFarmer ? 'Farmer' : 'Mill Owner'}
    </span>
  );
}

// ─── Reject modal ─────────────────────────────────────────────────────────────
function RejectModal({ user, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-red-400/30 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-400/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Reject Verification</h2>
              <p className="text-xs text-muted-foreground">{user.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Provide a reason for rejection. This is kept for records.
          </p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Reason for rejection (optional)..."
            className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 resize-none transition-all"
          />
          <div className="flex gap-3">
            <button
              onClick={() => onConfirm(reason)}
              disabled={loading}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Rejecting…' : 'Confirm Reject'}
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 bg-muted hover:bg-muted/70 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Details modal ────────────────────────────────────────────────────────────
function UserModal({ user, onClose }) {
  const isFarmer = user.role === 'FARMER';
  const details  = isFarmer ? user.farmDetails : user.businessDetails;
  
  const DetailRow = ({ icon: Icon, label, value }) => value ? (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-base">{user.fullName}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge user={user} />
            <RoleBadge role={user.role} />
            <button onClick={onClose} className="ml-2 p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Basic Info</p>
            <DetailRow icon={Hash}     label="NIC"            value={user.nic} />
            <DetailRow icon={Phone}    label="Phone"          value={user.phone} />
            <DetailRow icon={Mail}     label="Email"          value={user.email} />
            <DetailRow icon={Calendar} label="Registered Date" value={fmt(user.createdAt)} />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {isFarmer ? 'Farm Details' : 'Business Details'}
            </p>
            {isFarmer ? (
              <>
                <DetailRow icon={MapPin}  label="District"              value={details?.operatingDistrict} />
                <DetailRow icon={Layers}  label="Land Size"             value={details?.landSize ? `${details.landSize} acres` : null} />
                <DetailRow icon={Tractor} label="Paddy Types"           value={details?.paddyTypesCultivated?.join(', ')} />
                <DetailRow icon={FileText} label="Monthly Stock (est.)" value={details?.estimatedMonthlyStock ? `${details.estimatedMonthlyStock} kg` : null} />
              </>
            ) : (
              <>
                <DetailRow icon={Building2} label="Business Name"   value={details?.businessName} />
                <DetailRow icon={Hash}      label="Reg. Number"     value={details?.businessRegistrationNumber} />
                <DetailRow icon={MapPin}    label="Mill Location"   value={details?.millLocation} />
                <DetailRow icon={Layers}    label="Mill Capacity"   value={details?.millCapacity ? `${details.millCapacity} MT` : null} />
                <DetailRow icon={Phone}     label="Business Phone"  value={details?.businessPhone} />
              </>
            )}
            {details?.rejectionReason && (
              <div className="mt-4 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                <strong>Rejection Reason:</strong> {details.rejectionReason}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [viewUser, setViewUser]     = useState(null);
  const [rejectUser, setRejectUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)      params.set('search', search);
      if (roleFilter)  params.set('role',   roleFilter);
      if (statusFilter) params.set('status', statusFilter);

      const { data } = await axios.get(`${API}/users?${params}`, { headers: headers() });
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    // Debounce search typing
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, fetchUsers]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAction = async (user, actionType) => {
    if (actionType === 'delete') {
       if(!window.confirm(`Are you sure you want to permanently delete ${user.fullName}?`)) return;
    }
    
    setActionLoading(user._id);
    try {
      if (actionType === 'delete') {
         await axios.delete(`${API}/users/${user._id}`, { headers: headers() });
      } else {
         await axios.put(`${API}/users/${user._id}/${actionType}`, {}, { headers: headers() });
      }
      
      toast.success(`User ${actionType}d successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${actionType} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectUser) return;
    setActionLoading(rejectUser._id);
    try {
      await axios.put(`${API}/users/${rejectUser._id}/reject`, { reason }, { headers: headers() });
      toast.success(`${rejectUser.fullName} rejected`);
      setRejectUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const TABLE_HEADERS = ['Name', 'Role', 'Email', 'District', 'Status', 'Joined', 'Actions'];

  return (
    <div className="max-w-[1320px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1.5">User Management</h1>
          <p className="text-muted-foreground text-sm">
            View and manage all registered unprivileged accounts
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading && !search ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-6 bg-card border border-border p-3 rounded-2xl">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-muted border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-muted border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="FARMER">Farmers</option>
          <option value="MILL_OWNER">Mill Owners</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-muted border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-64">
            <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-64 text-muted-foreground">
            <User className="w-12 h-12 opacity-20" />
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  {TABLE_HEADERS.map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isFarmer = user.role === 'FARMER';
                  const loc = isFarmer ? user.farmDetails?.operatingDistrict : user.businessDetails?.millLocation;
                  const vstatus = isFarmer ? user.farmDetails?.verificationStatus : user.businessDetails?.verificationStatus;
                  
                  return (
                    <tr key={user._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-medium text-sm">{user.fullName}</div>
                        {user.businessDetails?.businessName && (
                          <div className="text-xs text-muted-foreground">{user.businessDetails.businessName}</div>
                        )}
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">{loc || '—'}</td>
                      <td className="px-5 py-4"><StatusBadge user={user} /></td>
                      <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{fmt(user.createdAt)}</td>
                      
                      <td className="px-5 py-4">
                        {/* Actions Group */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewUser(user)} title="View Details" className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {user.role !== 'ADMIN' && (
                            <>
                              {(vstatus === 'PENDING' || vstatus === 'REJECTED') && !user.isBlocked && (
                                <button onClick={() => handleAction(user, 'approve')} title="Approve Verification" disabled={actionLoading === user._id} className="p-1.5 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors disabled:opacity-50">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              
                              {(vstatus === 'PENDING' || vstatus === 'APPROVED') && !user.isBlocked && (
                                <button onClick={() => setRejectUser(user)} title="Reject Verification" disabled={actionLoading === user._id} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors disabled:opacity-50">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}

                              {user.isBlocked ? (
                                <button onClick={() => handleAction(user, 'unblock')} title="Unblock User" disabled={actionLoading === user._id} className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors disabled:opacity-50">
                                  <ShieldCheck className="w-4 h-4" />
                                </button>
                              ) : (
                                <button onClick={() => handleAction(user, 'block')} title="Block / Suspend User" disabled={actionLoading === user._id} className="p-1.5 hover:bg-gray-500/20 text-gray-400 rounded-lg transition-colors disabled:opacity-50">
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button onClick={() => handleAction(user, 'delete')} title="Delete User Permanently" disabled={actionLoading === user._id} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors disabled:opacity-50">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && users.length > 0 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing <strong className="text-foreground">{users.length}</strong> user{users.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {viewUser && <UserModal user={viewUser} onClose={() => setViewUser(null)} />}
      
      {rejectUser && (
        <RejectModal
          user={rejectUser}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectUser(null)}
          loading={actionLoading === rejectUser._id}
        />
      )}
    </div>
  );
}
