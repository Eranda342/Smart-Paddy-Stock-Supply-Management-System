import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, CheckCircle, XCircle, Eye, User,
  ShieldCheck, ShieldX, Clock, FileText, Tractor, Building2,
  X, AlertTriangle, Phone, Mail, Hash, MapPin, Layers, Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { FormTextarea } from '../../components/ui/form-fields';

const API = 'http://localhost:5000/api/admin';

// ─── helpers ─────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING:  { cls: 'text-amber-400  bg-amber-400/10  border-amber-400/25',  icon: Clock,        label: 'Pending' },
    APPROVED: { cls: 'text-green-400  bg-green-400/10  border-green-400/25',  icon: ShieldCheck,  label: 'Approved' },
    REJECTED: { cls: 'text-red-400    bg-red-400/10    border-red-400/25',    icon: ShieldX,      label: 'Rejected' },
  };
  const s = map[status] || map.PENDING;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
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

// ─── Document preview modal ───────────────────────────────────────────────────
function DocModal({ user, onClose }) {
  const isFarmer = user.role === 'FARMER';
  const details  = isFarmer ? user.farmDetails : user.businessDetails;
  const docPath  = isFarmer ? details?.landDocument : details?.businessDocument;
  // Strip any accidental leading path segments; the server serves files under /uploads/*
  const bareFilename = docPath ? docPath.replace(/^.*[\\/]/, '') : null;
  const docUrl   = bareFilename ? `http://localhost:5000/uploads/${bareFilename}` : null;
  const isImage  = docUrl && /\.(png|jpg|jpeg|webp|gif)$/i.test(docUrl);
  const isPdf    = docUrl && /\.pdf$/i.test(docUrl);

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
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
          <div className="flex items-center gap-2">
            <RoleBadge role={user.role} />
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left: User info */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Personal Details
            </p>
            <DetailRow icon={Hash}     label="NIC"            value={user.nic} />
            <DetailRow icon={Phone}    label="Phone"          value={user.phone} />
            <DetailRow icon={Mail}     label="Email"          value={user.email} />
            <DetailRow icon={Calendar} label="Registered"     value={fmt(user.createdAt)} />

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
          </div>

          {/* Right: Document preview */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {isFarmer ? 'Land Document' : 'Business Document'}
            </p>

            {docUrl ? (
              isImage ? (
                <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                  <img
                    src={docUrl}
                    alt="Document"
                    className="w-full object-contain max-h-64"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="p-3 flex items-center justify-between border-t border-border">
                    <span className="text-xs text-muted-foreground">Document preview</span>
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-[#22C55E] hover:underline font-medium"
                    >
                      <Eye className="w-3 h-3" /> Open full size
                    </a>
                  </div>
                </div>
              ) : isPdf ? (
                <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]">
                  <FileText className="w-10 h-10 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">PDF Document</p>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/25 rounded-lg text-xs font-medium hover:bg-[#22C55E]/20 transition-colors"
                  >
                    Open PDF
                  </a>
                </div>
              ) : (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#22C55E] text-sm hover:underline"
                >
                  <FileText className="w-4 h-4" /> View Document
                </a>
              )
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2 min-h-[160px] text-muted-foreground">
                <FileText className="w-8 h-8 opacity-30" />
                <p className="text-sm">No document uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Optionally provide a reason. The user will not see this — it's for admin records.
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

// ─── User row card ────────────────────────────────────────────────────────────
function UserRow({ user, onApprove, onReject, onView, actionLoading }) {
  const isFarmer  = user.role === 'FARMER';
  const details   = isFarmer ? user.farmDetails : user.businessDetails;
  const vstatus   = details?.verificationStatus ?? 'PENDING';
  const isLoading = actionLoading === user._id;

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
      {/* Name + Email */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
            {isFarmer
              ? <Tractor className="w-4 h-4 text-emerald-400" />
              : <Building2 className="w-4 h-4 text-blue-400" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>
      {/* Role */}
      <td className="px-4 py-4"><RoleBadge role={user.role} /></td>
      {/* NIC / Reg */}
      <td className="px-4 py-4">
        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
          {user.nic || '—'}
        </span>
      </td>
      {/* District / Location */}
      <td className="px-4 py-4 text-sm text-muted-foreground">
        {isFarmer
          ? details?.operatingDistrict || '—'
          : details?.millLocation     || '—'
        }
      </td>
      {/* Document */}
      <td className="px-4 py-4">
        {(isFarmer ? details?.landDocument : details?.businessDocument) ? (
          <button
            onClick={() => onView(user)}
            className="flex items-center gap-1.5 text-xs text-[#22C55E] hover:underline font-medium"
          >
            <FileText className="w-3.5 h-3.5" /> View Doc
          </button>
        ) : (
          <span className="text-xs text-muted-foreground italic">Not uploaded</span>
        )}
      </td>
      {/* Status */}
      <td className="px-4 py-4"><StatusBadge status={vstatus} /></td>
      {/* Submitted */}
      <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
        {fmt(user.createdAt)}
      </td>
      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon"
            onClick={() => onView(user)}
            title="View Details"
            className="text-blue-400 hover:bg-blue-400/10"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {vstatus === 'PENDING' && (
            <>
              <Button variant="ghost" size="icon"
                onClick={() => onApprove(user)}
                disabled={isLoading}
                title="Approve"
                className="text-green-400 hover:bg-green-400/10 disabled:opacity-40"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon"
                onClick={() => onReject(user)}
                disabled={isLoading}
                title="Reject"
                className="text-red-400 hover:bg-red-400/10 disabled:opacity-40"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          {isLoading && (
            <div className="w-4 h-4 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin ml-1" />
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PendingVerifications() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [viewUser, setViewUser]     = useState(null);
  const [rejectUser, setRejectUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // Counts for the stat cards (always from ALL stati)
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)      params.set('search', search);
      if (roleFilter)  params.set('role',   roleFilter);
      params.set('status', statusFilter);

      const { data } = await axios.get(`${API}/verifications?${params}`, { headers: headers() });
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  // Fetch counts for all statuses in background
  const fetchCounts = useCallback(async () => {
    try {
      const [p, a, r] = await Promise.all([
        axios.get(`${API}/verifications?status=PENDING`,  { headers: headers() }),
        axios.get(`${API}/verifications?status=APPROVED`, { headers: headers() }),
        axios.get(`${API}/verifications?status=REJECTED`, { headers: headers() }),
      ]);
      setCounts({
        PENDING:  p.data.count,
        APPROVED: a.data.count,
        REJECTED: r.data.count,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const refresh = () => { fetchUsers(); fetchCounts(); };

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (user) => {
    setActionLoading(user._id);
    try {
      await axios.put(`${API}/verifications/${user._id}/approve`, {}, { headers: headers() });
      toast.success(`${user.fullName} approved ✓`);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleRejectConfirm = async (reason) => {
    if (!rejectUser) return;
    setRejectLoading(true);
    try {
      await axios.put(
        `${API}/verifications/${rejectUser._id}/reject`,
        { reason },
        { headers: headers() }
      );
      toast.success(`${rejectUser.fullName} rejected`);
      setRejectUser(null);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setRejectLoading(false);
    }
  };

  // ── Stat cards config ──────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Pending Review',
      value: counts.PENDING,
      color: 'text-amber-400',
      bg:    'bg-amber-400/10',
      border:'border-amber-400/20',
      icon:  Clock,
      status:'PENDING',
    },
    {
      label: 'Approved',
      value: counts.APPROVED,
      color: 'text-green-400',
      bg:    'bg-green-400/10',
      border:'border-green-400/20',
      icon:  ShieldCheck,
      status:'APPROVED',
    },
    {
      label: 'Rejected',
      value: counts.REJECTED,
      color: 'text-red-400',
      bg:    'bg-red-400/10',
      border:'border-red-400/20',
      icon:  ShieldX,
      status:'REJECTED',
    },
  ];

  const TABLE_HEADERS = ['User', 'Role', 'NIC / Reg', 'Location', 'Document', 'Status', 'Submitted', 'Actions'];

  return (
    <div className="max-w-[1320px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1.5">Pending Verifications</h1>
          <p className="text-muted-foreground text-sm">
            Review farmer &amp; mill owner KYC submissions — approve or reject with reason
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* ── Stat cards (clickable filter) ── */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {statCards.map(({ label, value, color, bg, border, icon: Icon, status }) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            className={`bg-card border rounded-2xl p-5 flex items-center gap-4 text-left transition-all duration-200 ${
              statusFilter === status
                ? `${border} shadow-[0_0_24px_rgba(34,197,94,0.07)]`
                : 'border-border hover:border-opacity-60'
            }`}
          >
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or NIC…"
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
        >
          <option value="">All Roles</option>
          <option value="FARMER">Farmers only</option>
          <option value="MILL_OWNER">Mill Owners only</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 text-sm transition-all"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 h-64">
            <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading verifications…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-64 text-muted-foreground">
            <ShieldCheck className="w-12 h-12 opacity-20" />
            <p className="font-medium">No users found</p>
            <p className="text-sm opacity-60">
              {statusFilter === 'PENDING'
                ? 'All verifications are up to date!'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {TABLE_HEADERS.map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <UserRow
                    key={user._id}
                    user={user}
                    onApprove={handleApprove}
                    onReject={setRejectUser}
                    onView={setViewUser}
                    actionLoading={actionLoading}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && users.length > 0 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{users.length}</span> result{users.length !== 1 ? 's' : ''}
              {statusFilter ? ` · ${statusFilter.toLowerCase()}` : ''}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {viewUser   && <DocModal user={viewUser} onClose={() => setViewUser(null)} />}
      {rejectUser && (
        <RejectModal
          user={rejectUser}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectUser(null)}
          loading={rejectLoading}
        />
      )}
    </div>
  );
}
