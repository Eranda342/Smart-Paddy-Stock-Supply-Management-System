import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertCircle, CheckCircle, Clock, User, MessageSquare,
  HelpCircle, Send, Paperclip, ArrowUpRight, X,
  Package, DollarSign, FileText, ChevronRight, ShieldAlert,
  Calendar, ThumbsUp, ThumbsDown, Info, Activity, Download, Truck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_BASE   = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const STATUS_CONFIG = {
  OPEN:         { label: 'Open',         cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', dot: 'bg-yellow-400' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'text-blue-400   bg-blue-400/10   border-blue-400/30',   dot: 'bg-blue-400'   },
  RESOLVED:     { label: 'Resolved',     cls: 'text-green-400  bg-green-400/10  border-green-400/30',  dot: 'bg-green-400'  },
  REJECTED:     { label: 'Rejected',     cls: 'text-red-400    bg-red-400/10    border-red-400/30',    dot: 'bg-red-400'    },
};

const DISPUTE_TYPE_META = {
  QUANTITY_MISMATCH: { icon: '⚖️', label: 'Quantity Mismatch' },
  PAYMENT_ISSUE:     { icon: '💳', label: 'Payment Issue'     },
  QUALITY_ISSUE:     { icon: '🌾', label: 'Quality Issue'     },
  TRANSPORT_ISSUE:   { icon: '🚚', label: 'Transport Issue'   },
  OTHER:             { icon: '📋', label: 'Other'             },
};

const DECISION_TYPES = [
  { value: '',                    label: 'No specific action'  },
  { value: 'REFUND_RECOMMENDED',  label: '💰 Refund Recommended' },
  { value: 'PARTIAL_ADJUSTMENT',  label: '⚖️ Partial Adjustment' },
  { value: 'WARNING_ISSUED',      label: '⚠️ Warning Issued'     },
  { value: 'NO_ACTION',           label: '🚫 No Action'          },
];

const STAGE_FILTERS = ['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const fmt  = (n) => new Intl.NumberFormat('en-LK').format(n || 0);
const fmtD = (iso) => iso ? new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtT = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

export default function AdminDisputes() {
  const [disputes,        setDisputes]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [statusFilter,    setStatusFilter]    = useState('ALL');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeTab,       setActiveTab]       = useState('details'); // 'details' | 'chat' | 'audit'

  // Admin action states
  const [actionLoading,   setActionLoading]  = useState(false);
  const [showResolve,     setShowResolve]    = useState(false);
  const [showReject,      setShowReject]     = useState(false);
  const [showRequestInfo, setShowRequestInfo]= useState(false);
  const [resolutionText,  setResolutionText] = useState('');
  const [rejectionText,   setRejectionText]  = useState('');
  const [requestInfoText, setRequestInfoText]= useState('');
  const [decisionType,    setDecisionType]   = useState('');
  const [chatInput,       setChatInput]      = useState('');
  const [chatSending,     setChatSending]    = useState(false);
  
  // Transaction Modal State
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const socketRef        = useRef();
  const chatEndRef       = useRef();
  const fetchDisputesRef = useRef(null);

  // ── Socket ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const sock = io(SOCKET_URL);
    socketRef.current = sock;
    sock.on('connect',    () => setSocketConnected(true));
    sock.on('disconnect', () => setSocketConnected(false));
    if (sock.connected) setSocketConnected(true);
    sock.on('disputeUpdated', () => fetchDisputesRef.current?.());
    sock.on('disputeMessage', (msg) => {
      setSelectedDispute(prev => prev ? { ...prev, messages: [...(prev.messages || []), msg] } : prev);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    const poll = setInterval(() => fetchDisputesRef.current?.(), 20000);
    return () => { sock.disconnect(); clearInterval(poll); };
  }, []);

  // ── Fetch disputes ─────────────────────────────────────────────────────────
  const fetchDisputes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/admin/disputes`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      setDisputes(data.disputes || []);
    } catch { toast.error('Failed to load disputes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDisputesRef.current = fetchDisputes; }, [fetchDisputes]);
  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  // ── Open dispute ────────────────────────────────────────────────────────────
  const openDispute = (d) => {
    setSelectedDispute(d);
    setActiveTab('details');
    setShowResolve(false);
    setShowReject(false);
    setShowRequestInfo(false);
    setResolutionText('');
    setRejectionText('');
    setRequestInfoText('');
    setDecisionType('');
    socketRef.current?.emit('joinDispute', d._id);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  // Live-sync selected dispute
  useEffect(() => {
    if (!selectedDispute || actionLoading) return;
    const fresh = disputes.find(d => d._id === selectedDispute._id);
    if (fresh && fresh.updatedAt !== selectedDispute.updatedAt) setSelectedDispute(fresh);
  }, [disputes]);

  // ── Admin actions ──────────────────────────────────────────────────────────
  const handleSetUnderReview = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/admin/disputes/${selectedDispute._id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'UNDER_REVIEW' }),
      });
      await fetchDisputes();
      toast.success('Marked as Under Review — parties notified via email');
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(false); }
  };

  const handleRequestInfo = async () => {
    if (!requestInfoText.trim()) { toast.error('Enter a message.'); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/admin/disputes/${selectedDispute._id}/request-info`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: requestInfoText.trim() }),
      });
      const json  = await res.json();
      if (!res.ok) { toast.error(json.message || 'Failed'); return; }
      await fetchDisputes();
      toast.success('Information request sent — parties notified via email');
      setShowRequestInfo(false);
      setRequestInfoText('');
      setActiveTab('chat');
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(false); }
  };

  const handleResolve = async () => {
    if (!resolutionText.trim()) { toast.error('Resolution message is required.'); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/admin/disputes/${selectedDispute._id}/resolve`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resolution: resolutionText.trim(), decisionType }),
      });
      const json  = await res.json();
      if (!res.ok) { toast.error(json.message || 'Failed'); return; }
      await fetchDisputes();
      toast.success('Dispute resolved — parties notified via email ✅');
      setShowResolve(false);
      setResolutionText('');
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/admin/disputes/${selectedDispute._id}/reject`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resolution: rejectionText.trim() || 'Dispute rejected by administrator.' }),
      });
      const json  = await res.json();
      if (!res.ok) { toast.error(json.message || 'Failed'); return; }
      await fetchDisputes();
      toast.success('Dispute rejected — parties notified via email');
      setShowReject(false);
      setRejectionText('');
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(false); }
  };

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatSending) return;
    const optimistic = { _id: `temp-${Date.now()}`, message: trimmed, senderRole: 'ADMIN', createdAt: new Date().toISOString() };
    setSelectedDispute(prev => prev ? { ...prev, messages: [...(prev.messages || []), optimistic] } : prev);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      setChatSending(true);
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/disputes/${selectedDispute._id}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: trimmed }),
      });
    } catch { toast.error('Failed to send'); }
    finally { setChatSending(false); }
  };

  const isClosed = (d) => ['RESOLVED', 'REJECTED'].includes(d?.status);

  const filtered = statusFilter === 'ALL' ? disputes : disputes.filter(d => d.status === statusFilter);

  const counts = STAGE_FILTERS.reduce((acc, s) => {
    acc[s] = s === 'ALL' ? disputes.length : disputes.filter(d => d.status === s).length;
    return acc;
  }, {});

  const accentCls = {
    ALL:          'bg-white/5 border-white/20 text-white',
    OPEN:         'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
    UNDER_REVIEW: 'bg-blue-400/10 border-blue-400/30 text-blue-400',
    RESOLVED:     'bg-green-400/10 border-green-400/30 text-green-400',
    REJECTED:     'bg-red-400/10 border-red-400/30 text-red-400',
  };

  const resetActions = () => {
    setShowResolve(false); setShowReject(false); setShowRequestInfo(false);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1320px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dispute Management</h1>
          <p className="text-white/50 text-sm flex items-center gap-2">
            Review and resolve user disputes
            {socketConnected && <span className="inline-flex w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live sync" />}
          </p>
        </div>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STAGE_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
            className={`border rounded-2xl p-4 text-left transition-all ${statusFilter === s ? accentCls[s] : 'bg-white/[0.03] border-white/8 text-white/60 hover:bg-white/[0.06]'}`}>
            <div className="text-xs font-medium mb-1 opacity-70">{s.replace('_', ' ')}</div>
            <div className="text-2xl font-bold">{counts[s]}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl text-white/40">
          <HelpCircle className="w-8 h-8 mb-2 opacity-30" />
          <p>No disputes found.</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['Case', 'Type', 'Transaction', 'Raised By', 'Status', 'Filed', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-white/40 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const typeMeta = DISPUTE_TYPE_META[d.disputeType] || DISPUTE_TYPE_META.OTHER;
                return (
                  <tr key={d._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white line-clamp-1 max-w-[160px]">{d.title || 'Untitled'}</p>
                      <p className="text-xs text-white/40 mt-0.5">#{d._id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm">{typeMeta.icon}</span>
                      <span className="text-xs text-white/50 ml-1.5">{typeMeta.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      {d.transaction ? (
                        <div>
                          <p className="font-mono text-xs text-white/80">
                            {d.transaction.orderNumber ? `#${d.transaction.orderNumber}` : `#${d.transaction._id?.slice(-6).toUpperCase()}`}
                          </p>
                          <p className="text-xs text-white/40">Rs {fmt(d.transaction.totalAmount)}</p>
                        </div>
                      ) : <span className="text-white/30">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-sm">{d.raisedBy?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-white/40 capitalize">{d.raisedBy?.role?.replace('_', ' ').toLowerCase()}</p>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                    <td className="px-5 py-4 text-xs text-white/40">{fmtD(d.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => openDispute(d)}
                        className="flex items-center gap-1 text-[#22C55E] hover:text-[#4ade80] font-medium text-xs transition-colors ml-auto">
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── DISPUTE DETAIL MODAL ──────────────────────────────────────────────── */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !actionLoading && setSelectedDispute(null)} />
          <div className="relative bg-[#0A1120] border border-white/10 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-white">{selectedDispute.title || 'Untitled Dispute'}</h2>
                    <StatusBadge status={selectedDispute.status} />
                  </div>
                  <p className="text-xs text-white/40">
                    {DISPUTE_TYPE_META[selectedDispute.disputeType]?.icon || '📋'}{' '}
                    {DISPUTE_TYPE_META[selectedDispute.disputeType]?.label || 'Dispute'} · Filed {fmtD(selectedDispute.createdAt)}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDispute(null)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/8 shrink-0 px-4">
              {[
                { id: 'details', icon: <FileText className="w-3.5 h-3.5" />, label: 'Details' },
                { id: 'chat',    icon: <MessageSquare className="w-3.5 h-3.5" />, label: `Chat${selectedDispute.messages?.length ? ` (${selectedDispute.messages.length})` : ''}` },
                { id: 'audit',   icon: <Activity className="w-3.5 h-3.5" />, label: `Audit Log${selectedDispute.auditLog?.length ? ` (${selectedDispute.auditLog.length})` : ''}` },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id ? 'border-[#22C55E] text-[#22C55E]' : 'border-transparent text-white/40 hover:text-white/60'
                  }`}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 flex flex-col lg:flex-row gap-6">

                {/* ── LEFT / MAIN CONTENT ─────────────────────────────────────── */}
                <div className="lg:w-[60%] space-y-4">

                  {activeTab === 'details' && (
                    <>
                      {/* Transaction Details */}
                      {selectedDispute.transaction ? (
                        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Transaction Context</p>
                            <button onClick={() => setShowTransactionModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">
                              <ArrowUpRight className="w-3.5 h-3.5" /> View Transaction
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div><p className="text-white/40 text-xs mb-1 flex items-center gap-1"><FileText className="w-3 h-3" />Order #</p>
                              <p className="font-mono text-white font-semibold">{selectedDispute.transaction.orderNumber || selectedDispute.transaction._id?.slice(-6).toUpperCase()}</p></div>
                            <div><p className="text-white/40 text-xs mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" />Total</p>
                              <p className="text-[#22C55E] font-semibold">Rs {fmt(selectedDispute.transaction.totalAmount)}</p></div>
                            <div><p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Package className="w-3 h-3" />Qty</p>
                              <p className="text-white font-semibold">{fmt(selectedDispute.transaction.quantityKg)} kg</p></div>
                            <div><p className="text-white/40 text-xs mb-1">Price/kg</p>
                              <p className="text-white">Rs {fmt(selectedDispute.transaction.finalPricePerKg)}</p></div>
                            <div><p className="text-white/40 text-xs mb-1">Paddy Type</p>
                              <p className="text-white">{selectedDispute.transaction.listing?.paddyType || '—'}</p></div>
                            <div><p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Date</p>
                              <p className="text-white">{fmtD(selectedDispute.transaction.createdAt)}</p></div>
                            <div><p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Truck className="w-3 h-3" />Transport</p>
                              <p className="text-white">{selectedDispute.transaction.transportStatus?.replace(/_/g, ' ') || 'PENDING'}</p></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-lg">
                              <p className="text-xs text-white/40 mb-1">🌾 Farmer</p>
                              <p className="font-medium text-white text-sm">{selectedDispute.transaction.farmer?.fullName || '—'}</p>
                              <p className="text-xs text-white/40">{selectedDispute.transaction.farmer?.email}</p>
                            </div>
                            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                              <p className="text-xs text-white/40 mb-1">🏭 Mill Owner</p>
                              <p className="font-medium text-white text-sm">{selectedDispute.transaction.millOwner?.fullName || '—'}</p>
                              <p className="text-xs text-white/40">{selectedDispute.transaction.millOwner?.email}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-xl">
                          No transaction linked to this dispute.
                        </div>
                      )}

                      {/* Complaint */}
                      <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Complaint</p>
                        <p className="text-sm text-white/80 leading-relaxed">{selectedDispute.description}</p>
                      </div>

                      {/* Raised By */}
                      <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Raised By</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
                            {selectedDispute.raisedBy?.fullName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{selectedDispute.raisedBy?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-white/40">{selectedDispute.raisedBy?.email}</p>
                            <p className="text-xs text-[#22C55E] capitalize">{selectedDispute.raisedBy?.role?.replace('_', ' ').toLowerCase()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Evidence */}
                      {selectedDispute.attachments?.length > 0 && (
                        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
                          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Evidence ({selectedDispute.attachments.length})</p>
                          <div className="space-y-2">
                            {selectedDispute.attachments.map(att => (
                              <a key={att._id || att.fileName} href={`http://localhost:5000${att.fileUrl}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-between p-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 rounded-lg transition-colors group text-sm">
                                <span className="flex items-center gap-2 text-white/60 group-hover:text-white"><Paperclip className="w-3.5 h-3.5 text-[#22C55E]" />{att.fileName}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#22C55E]" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution block */}
                      {isClosed(selectedDispute) && selectedDispute.resolution && (
                        <div className={`p-4 rounded-xl border ${selectedDispute.status === 'RESOLVED' ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
                            {selectedDispute.status === 'RESOLVED' ? '✅ Resolution' : '❌ Rejection Reason'}
                          </p>
                          {selectedDispute.decisionType && (
                            <p className="text-xs font-bold mb-1 opacity-80">
                              {DECISION_TYPES.find(d => d.value === selectedDispute.decisionType)?.label || selectedDispute.decisionType}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed">{selectedDispute.resolution}</p>
                          {selectedDispute.resolvedBy && (
                            <p className="text-xs opacity-40 mt-2">Closed by {selectedDispute.resolvedBy?.fullName || 'Admin'} · {fmtD(selectedDispute.resolvedAt)}</p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Chat Tab */}
                  {activeTab === 'chat' && (
                    <div className="bg-white/[0.02] border border-white/8 rounded-xl flex flex-col min-h-[420px]">
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[360px]">
                        {(!selectedDispute.messages || selectedDispute.messages.length === 0) && (
                          <div className="text-center text-white/30 text-sm mt-8">No messages yet.</div>
                        )}
                        {(selectedDispute.messages || []).map((msg, i) => {
                          const isAdmin = msg.senderRole === 'ADMIN';
                          return (
                            <div key={msg._id || i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[78%] rounded-2xl p-3 text-sm ${isAdmin ? 'bg-[#22C55E] text-black rounded-tr-sm' : 'bg-white/5 text-white rounded-tl-sm'}`}>
                                <p className={`text-[10px] font-semibold mb-1 ${isAdmin ? 'text-black/60' : 'text-[#22C55E]'}`}>
                                  {isAdmin ? 'AgroBridge Admin' : (msg.sender?.fullName || msg.senderRole?.replace('_', ' '))}
                                </p>
                                <p>{msg.message}</p>
                                <p className={`text-[10px] text-right mt-1 ${isAdmin ? 'text-black/50' : 'text-white/30'}`}>{fmtT(msg.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                      {!isClosed(selectedDispute) && (
                        <div className="p-3 border-t border-white/8 flex gap-2">
                          <input
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            placeholder="Send a message…"
                            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#22C55E]/50"
                            disabled={chatSending}
                          />
                          <button onClick={handleSendMessage} disabled={chatSending || !chatInput.trim()}
                            className="px-4 py-2.5 bg-[#22C55E] hover:bg-[#16a34a] text-black rounded-xl transition-colors disabled:opacity-50">
                            {chatSending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audit Log Tab */}
                  {activeTab === 'audit' && (
                    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
                      {(!selectedDispute.auditLog || selectedDispute.auditLog.length === 0) ? (
                        <div className="text-center text-white/30 text-sm py-8">No audit entries yet.</div>
                      ) : (
                        <div className="relative pl-5">
                          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
                          <div className="space-y-4">
                            {selectedDispute.auditLog.map((entry, i) => (
                              <div key={i} className="relative flex gap-3 text-xs">
                                <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#0A1120] shrink-0" />
                                <div className="ml-1">
                                  <p className="font-semibold text-white">{entry.action.replace(/_/g, ' ')}</p>
                                  {entry.note && <p className="text-white/50 mt-0.5 leading-relaxed">{entry.note}</p>}
                                  <p className="text-white/30 mt-1">{fmtD(entry.timestamp)} · {fmtT(entry.timestamp)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* ── RIGHT / ACTION ENGINE ─────────────────────────────────── */}
                <div className="lg:w-[40%] flex flex-col gap-4">

                  {/* Action Panel */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Admin Actions</p>

                    {isClosed(selectedDispute) ? (
                      <div className="text-center py-4">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm text-white/60 font-medium">This case is closed.</p>
                        <p className="text-xs text-white/30 mt-1">Status: {STATUS_CONFIG[selectedDispute.status]?.label}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Mark Under Review */}
                        {selectedDispute.status === 'OPEN' && !showResolve && !showReject && !showRequestInfo && (
                          <button onClick={handleSetUnderReview} disabled={actionLoading}
                            className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                            🔍 {actionLoading ? 'Processing…' : 'Mark as Under Review'}
                          </button>
                        )}

                        {/* Request More Info */}
                        {!showResolve && !showReject && (
                          <button onClick={() => { setShowRequestInfo(!showRequestInfo); }}
                            disabled={actionLoading}
                            className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                            <Info className="w-3.5 h-3.5 inline mr-2" />
                            {showRequestInfo ? 'Cancel' : 'Request More Info'}
                          </button>
                        )}
                        {showRequestInfo && (
                          <div className="space-y-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                            <textarea rows={3} value={requestInfoText} onChange={e => setRequestInfoText(e.target.value)}
                              placeholder="What additional information do you need?"
                              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 resize-none focus:outline-none" />
                            <div className="flex gap-2">
                              <button onClick={handleRequestInfo} disabled={actionLoading || !requestInfoText.trim()}
                                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-xs transition-colors">
                                {actionLoading ? 'Sending…' : 'Send Request'}
                              </button>
                              <button onClick={() => { setShowRequestInfo(false); setRequestInfoText(''); }}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg text-xs">Cancel</button>
                            </div>
                          </div>
                        )}

                        {/* Resolve */}
                        {!showResolve && !showReject && !showRequestInfo && (
                          <button onClick={() => { setShowResolve(true); resetActions(); setShowResolve(true); }} disabled={actionLoading}
                            className="w-full py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                            <ThumbsUp className="w-3.5 h-3.5 inline mr-2" />Resolve Dispute
                          </button>
                        )}
                        {showResolve && (
                          <div className="space-y-3 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                            <p className="text-xs font-semibold text-green-400">Decision Type</p>
                            <select value={decisionType} onChange={e => setDecisionType(e.target.value)}
                              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                              {DECISION_TYPES.map(d => <option key={d.value} value={d.value} className="bg-[#0A1120]">{d.label}</option>)}
                            </select>
                            <p className="text-xs font-semibold text-green-400">Resolution Message <span className="text-red-400">*</span></p>
                            <textarea rows={4} value={resolutionText} onChange={e => setResolutionText(e.target.value)}
                              placeholder="e.g. After review, a partial refund has been recommended. Buyer and seller have been notified."
                              className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 resize-none focus:outline-none" />
                            <div className="flex gap-2">
                              <button onClick={handleResolve} disabled={actionLoading || !resolutionText.trim()}
                                className="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm">
                                {actionLoading ? 'Resolving…' : 'Confirm Resolution'}
                              </button>
                              <button onClick={() => { setShowResolve(false); setResolutionText(''); }}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg text-sm">Cancel</button>
                            </div>
                          </div>
                        )}

                        {/* Reject */}
                        {!showReject && !showResolve && !showRequestInfo && (
                          <button onClick={() => { setShowReject(true); resetActions(); setShowReject(true); }} disabled={actionLoading}
                            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                            <ThumbsDown className="w-3.5 h-3.5 inline mr-2" />Reject Dispute
                          </button>
                        )}
                        {showReject && (
                          <div className="space-y-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                            <p className="text-xs font-semibold text-red-400">Rejection Reason <span className="text-white/30">(optional)</span></p>
                            <textarea rows={3} value={rejectionText} onChange={e => setRejectionText(e.target.value)}
                              placeholder="e.g. Insufficient evidence. The complaint does not meet our dispute policy criteria."
                              className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 resize-none focus:outline-none" />
                            <div className="flex gap-2">
                              <button onClick={handleReject} disabled={actionLoading}
                                className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-lg text-sm">
                                {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
                              </button>
                              <button onClick={() => { setShowReject(false); setRejectionText(''); }}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg text-sm">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Case metadata */}
                  <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4 text-xs space-y-2 text-white/40">
                    <p><span className="text-white/20">Case ID</span> · <span className="font-mono text-white/60 ml-1">{selectedDispute._id.slice(-12).toUpperCase()}</span></p>
                    <p><span className="text-white/20">Status</span> · <span className="ml-1">{STATUS_CONFIG[selectedDispute.status]?.label}</span></p>
                    <p><span className="text-white/20">Messages</span> · <span className="ml-1">{selectedDispute.messages?.length || 0}</span></p>
                    <p><span className="text-white/20">Audit entries</span> · <span className="ml-1">{selectedDispute.auditLog?.length || 0}</span></p>
                    {selectedDispute.resolvedBy && (
                      <p><span className="text-white/20">Closed by</span> · <span className="ml-1">{selectedDispute.resolvedBy?.fullName || 'Admin'} on {fmtD(selectedDispute.resolvedAt)}</span></p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACTION MODAL ──────────────────────────────────────────────── */}
      {showTransactionModal && selectedDispute?.transaction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowTransactionModal(false)} />
          <div className="relative bg-[#0A1120] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-[#22C55E]" /> Full Transaction context
              </h2>
              <button onClick={() => setShowTransactionModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-1">Order Number</p>
                <p className="font-mono text-white text-lg font-bold">{selectedDispute.transaction.orderNumber || selectedDispute.transaction._id?.slice(-6).toUpperCase()}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-1">Total Amount</p>
                <p className="text-[#22C55E] text-lg font-bold">Rs {fmt(selectedDispute.transaction.totalAmount)}</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider border-b border-white/10 pb-2">Parties</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Farmer</span>
                  <span className="font-medium text-white">{selectedDispute.transaction.farmer?.fullName || '—'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Mill Owner</span>
                  <span className="font-medium text-white">{selectedDispute.transaction.millOwner?.fullName || '—'}</span>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider border-b border-white/10 pb-2">Status</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Payment</span>
                  <span className="font-medium text-white">{selectedDispute.transaction.paymentStatus}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Transport</span>
                  <span className="font-medium text-white">{selectedDispute.transaction.transportStatus?.replace(/_/g, ' ') || 'PENDING'}</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 col-span-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider border-b border-white/10 pb-2">Commodity</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-white/50 mb-1">Paddy Type</p>
                    <p className="font-medium text-white">{selectedDispute.transaction.listing?.paddyType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-white/50 mb-1">Quantity</p>
                    <p className="font-medium text-white">{fmt(selectedDispute.transaction.quantityKg)} kg</p>
                  </div>
                  <div>
                    <p className="text-white/50 mb-1">Price per Kg</p>
                    <p className="font-medium text-white">Rs {fmt(selectedDispute.transaction.finalPricePerKg)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
