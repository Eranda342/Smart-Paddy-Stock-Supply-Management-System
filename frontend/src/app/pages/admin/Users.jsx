import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, CheckCircle, XCircle, Eye, User,
  ShieldCheck, ShieldX, Clock, FileText, Tractor, Building2,
  X, AlertTriangle, Phone, Mail, Hash, MapPin, Layers, Calendar, Ban, Trash2, Download
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { FormTextarea } from '../../components/ui/form-fields';

const API = 'http://localhost:5000/api/admin';

// ─── helpers ─────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const getVerificationStatus = (user) => {
  if (user.role === 'ADMIN') return 'APPROVED';
  return user.role === 'FARMER' 
    ? user.farmDetails?.verificationStatus 
    : user.businessDetails?.verificationStatus;
};

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
        <ShieldCheck className="w-3 h-3" /> System Admin
      </span>
    );
  }

  const vstatus = getVerificationStatus(user);
  
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
        <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Provide a reason for rejection. This is kept for records.
          </p>
          <FormTextarea
            name="reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Reason for rejection (optional)..."
          />
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={() => onConfirm(reason)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Rejecting…' : 'Confirm Reject'}
            </Button>
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete modal ─────────────────────────────────────────────────────────────
function DeleteModal({ user, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-card border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Delete User</h2>
              <p className="text-xs text-muted-foreground">{user.fullName}</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" disabled={loading}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to permanently delete this user?
          </p>
          <p className="text-xs text-muted-foreground">
            This action cannot be undone. All data associated with <span className="font-medium text-foreground">{user.email}</span> will be removed.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none shadow-sm"
            >
              {loading ? 'Deleting…' : 'Delete'}
            </Button>
            <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Suspend modal ─────────────────────────────────────────────────────────────
function SuspendModal({ user, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-card border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Ban className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Suspend User</h2>
              <p className="text-xs text-muted-foreground">{user.fullName}</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" disabled={loading}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to suspend this user?
          </p>
          <p className="text-xs text-muted-foreground">
            The user <span className="font-medium text-foreground">{user.email}</span> will be locked out of the platform immediately until unblocked.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm"
            >
              {loading ? 'Suspending…' : 'Suspend'}
            </Button>
            <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Details modal ────────────────────────────────────────────────────────────
function UserModal({ user, onClose, onAction, actionLoading, onBlockPrompt }) {
  const [rejectMode, setRejectMode] = useState(user.rejectPrompt || false);
  const isFarmer = user.role === 'FARMER';
  const details  = isFarmer ? user.farmDetails : user.businessDetails;
  const vstatus = getVerificationStatus(user);
  
  const DetailRow = ({ icon: Icon, label, value }) => value ? (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{user.fullName}</h2>
                <div className="flex gap-2 items-center mt-1">
                  <RoleBadge role={user.role} />
                  <StatusBadge user={user} />
                </div>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-8">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">Basic Info</p>
              <DetailRow icon={Hash}     label="NIC"            value={user.nic} />
              <DetailRow icon={Phone}    label="Phone"          value={user.phone} />
              <DetailRow icon={Mail}     label="Email"          value={user.email} />
              <DetailRow icon={Calendar} label="Registered Date" value={fmt(user.createdAt)} />
            </div>

            {/* Section 2 & 3: Role Specific Data */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">
                {isFarmer ? 'Farm Details' : user.role === 'ADMIN' ? 'System Details' : 'Business Details'}
              </p>
              
              {user.role === 'ADMIN' && (
                <DetailRow icon={ShieldCheck} label="Access Level" value="Full System Access" />
              )}
              
              {isFarmer && details && (
                <>
                  <DetailRow icon={MapPin}  label="District"              value={details.operatingDistrict} />
                  <DetailRow icon={Layers}  label="Land Size"             value={details.landSize ? `${details.landSize} acres` : null} />
                  <DetailRow icon={Tractor} label="Paddy Types"           value={details.paddyTypesCultivated?.join(', ')} />
                  <DetailRow icon={FileText} label="Monthly Stock (est.)" value={details.estimatedMonthlyStock ? `${details.estimatedMonthlyStock} kg` : null} />
                  {details.landDocument && (
                    <DetailRow icon={Download} label="Land Document"      value={
                      <a href={`http://localhost:5000/uploads/${details.landDocument}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                        View Document PDF
                      </a>
                    } />
                  )}
                </>
              )}
              
              {user.role === 'MILL_OWNER' && details && (
                <>
                  <DetailRow icon={Building2} label="Business Name"   value={details.businessName} />
                  <DetailRow icon={Hash}      label="Reg. Number"     value={details.businessRegistrationNumber} />
                  <DetailRow icon={MapPin}    label="Mill Location"   value={details.millLocation} />
                  <DetailRow icon={Layers}    label="Mill Capacity"   value={details.millCapacity ? `${details.millCapacity} MT` : null} />
                  <DetailRow icon={Phone}     label="Business Phone"  value={details.businessPhone} />
                  {details.businessDocument && (
                    <DetailRow icon={Download} label="Business Document" value={
                      <a href={`http://localhost:5000/uploads/${details.businessDocument}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                        View Document PDF
                      </a>
                    } />
                  )}
                </>
              )}
              
              {details?.rejectionReason && (
                <div className="mt-4 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                  <strong>Rejection Reason:</strong> {details.rejectionReason}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 p-4 border-t border-border bg-muted/20 flex gap-3 justify-end items-center">
            {user.role !== 'ADMIN' && (
              <>
                <Button 
                  variant={user.isBlocked ? 'ghost' : 'secondary'}
                  onClick={() => {
                    if (user.isBlocked) {
                      onAction(user, 'unblock');
                    } else if (onBlockPrompt) {
                      onClose();
                      onBlockPrompt(user);
                    } else {
                      onAction(user, 'block');
                    }
                  }}
                  disabled={actionLoading === user._id}
                  className={user.isBlocked ? 'text-amber-500 hover:bg-amber-500/10' : 'text-gray-400 hover:bg-gray-500/10'}
                  size="sm"
                >
                  {user.isBlocked ? 'Unblock User' : 'Suspend User'}
                </Button>
                
                {(vstatus === 'PENDING' || vstatus === 'APPROVED') && !user.isBlocked && (
                  <Button 
                    variant="danger"
                    size="sm"
                    onClick={() => setRejectMode(true)}
                    disabled={actionLoading === user._id}
                  >
                    Reject
                  </Button>
                )}
                
                {(vstatus === 'PENDING' || vstatus === 'REJECTED') && !user.isBlocked && (
                  <Button 
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onAction(user, 'approve');
                      onClose();
                    }}
                    disabled={actionLoading === user._id}
                  >
                    Approve
                  </Button>
                )}
              </>
            )}
            {user.role === 'ADMIN' && (
              <span className="text-xs text-muted-foreground mr-auto italic px-2">
                System admin actions are restricted.
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={onClose} className="ml-2">
              Close
            </Button>
          </div>
        </div>
      </div>
      
      {rejectMode && (
        <RejectModal
          user={user}
          onConfirm={(reason) => {
            onAction(user, 'reject', reason);
            setRejectMode(false);
            onClose();
          }}
          onClose={() => setRejectMode(false)}
          loading={actionLoading === user._id}
        />
      )}
    </>
  );
}


// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  const [viewUser, setViewUser]     = useState(null);
  const [deletePromptUser, setDeletePromptUser] = useState(null);
  const [suspendPromptUser, setSuspendPromptUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/users`, { headers: headers() });
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Frontend Filtering Logic ───────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 1. Use correct field: user.verificationStatus
      // Dynamically map since backend may not provide it at root
      const verificationStatus = getVerificationStatus(user);

      const matchSearch =
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchRole =
        selectedRole === "ALL" || user.role === selectedRole;

      // 2. Match exact values from backend: "PENDING", "APPROVED", "REJECTED"
      const matchStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "BLOCKED" ? user.isBlocked : (!user.isBlocked && verificationStatus === selectedStatus));

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, selectedRole, selectedStatus]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAction = async (user, actionType, reason = '') => {
    if (user.role === 'ADMIN') return; // Disable actions for ADMIN user
    
    setActionLoading(user._id);
    try {
      if (actionType === 'delete') {
         await axios.delete(`${API}/users/${user._id}`, { headers: headers() });
      } else if (actionType === 'reject') {
         await axios.put(`${API}/users/${user._id}/reject`, { reason }, { headers: headers() });
      } else {
         await axios.put(`${API}/users/${user._id}/${actionType}`, {}, { headers: headers() });
      }
      
      if (actionType === 'delete') setDeletePromptUser(null);
      if (actionType === 'block') setSuspendPromptUser(null);
      
      const successMsg = actionType === 'delete' ? 'deleted' : actionType === 'block' ? 'suspended' : actionType === 'unblock' ? 'unblocked' : actionType + 'd';
      toast.success(`User ${successMsg} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${actionType} user`);
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
            View and manage all registered accounts
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchUsers}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          className="px-4 py-2.5 bg-muted border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="FARMER">Farmers</option>
          <option value="MILL_OWNER">Mill Owners</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-4 py-2.5 bg-muted border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
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
        ) : filteredUsers.length === 0 ? (
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
                {filteredUsers.map(user => {
                  const isFarmer = user.role === 'FARMER';
                  const loc = isFarmer ? user.farmDetails?.operatingDistrict : user.businessDetails?.millLocation;
                  const vstatus = getVerificationStatus(user);
                  
                  return (
                    <tr key={user._id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors group ${user.isBlocked ? 'opacity-50 bg-muted/10' : ''}`}>
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
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setViewUser(user)} title="View Details"
                            className="text-blue-400 hover:bg-blue-500/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {user.role !== 'ADMIN' && (
                            <>
                              {(vstatus === 'PENDING' || vstatus === 'REJECTED') && !user.isBlocked && (
                                <Button variant="ghost" size="icon" onClick={() => handleAction(user, 'approve')} title="Approve Verification" disabled={actionLoading === user._id}
                                  className="text-green-500 hover:bg-green-500/10 disabled:opacity-50">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {(vstatus === 'PENDING' || vstatus === 'APPROVED') && !user.isBlocked && (
                                <Button variant="ghost" size="icon" onClick={() => setViewUser({ ...user, rejectPrompt: true })} title="Reject Verification" disabled={actionLoading === user._id}
                                  className="text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}

                              {user.isBlocked ? (
                                <Button variant="ghost" size="icon" onClick={() => handleAction(user, 'unblock')} title="Unblock User" disabled={actionLoading === user._id}
                                  className="text-amber-500 hover:bg-amber-500/10 disabled:opacity-50">
                                  <ShieldCheck className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" onClick={() => setSuspendPromptUser(user)} title="Suspend User" disabled={actionLoading === user._id || suspendPromptUser?._id === user._id}
                                  className="text-amber-500 hover:bg-amber-500/10 disabled:opacity-50">
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button variant="ghost" size="icon" onClick={() => setDeletePromptUser(user)} title="Delete User Permanently" disabled={actionLoading === user._id || deletePromptUser?._id === user._id}
                                className="text-red-500 hover:bg-red-500/10 disabled:opacity-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
            <span>Showing <strong className="text-foreground">{filteredUsers.length}</strong> of {users.length} users</span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {viewUser && (
        <UserModal 
          user={viewUser} 
          onClose={() => setViewUser(null)} 
          onAction={handleAction}
          onBlockPrompt={(u) => setSuspendPromptUser(u)}
          actionLoading={actionLoading}
        />
      )}
      
      {deletePromptUser && (
        <DeleteModal
          user={deletePromptUser}
          onConfirm={() => handleAction(deletePromptUser, 'delete')}
          onClose={() => setDeletePromptUser(null)}
          loading={actionLoading === deletePromptUser._id}
        />
      )}

      {suspendPromptUser && (
        <SuspendModal
          user={suspendPromptUser}
          onConfirm={() => handleAction(suspendPromptUser, 'block')}
          onClose={() => setSuspendPromptUser(null)}
          loading={actionLoading === suspendPromptUser._id}
        />
      )}
    </div>
  );
}
