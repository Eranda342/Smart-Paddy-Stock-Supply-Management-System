import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HelpCircle, CheckCircle, Clock, MessageSquare, Plus, X,
  ArrowUpRight, UploadCloud, Paperclip, Send, AlertTriangle,
  FileText, Package, DollarSign, Calendar, Info, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_BASE   = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  OPEN:         { label: 'Open',         cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',   dot: 'bg-yellow-400' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30',         dot: 'bg-blue-400'   },
  RESOLVED:     { label: 'Resolved',     cls: 'text-green-400 bg-green-400/10 border-green-400/30',      dot: 'bg-green-400'  },
  REJECTED:     { label: 'Rejected',     cls: 'text-red-400 bg-red-400/10 border-red-400/30',            dot: 'bg-red-400'    },
};

const DISPUTE_TYPES = [
  { value: 'QUANTITY_MISMATCH', label: 'Quantity Mismatch',  icon: '⚖️' },
  { value: 'PAYMENT_ISSUE',     label: 'Payment Issue',      icon: '💳' },
  { value: 'QUALITY_ISSUE',     label: 'Quality Issue',      icon: '🌾' },
  { value: 'TRANSPORT_ISSUE',   label: 'Transport Issue',    icon: '🚚' },
  { value: 'OTHER',             label: 'Other',              icon: '📋' },
];

const TIMELINE_STEPS = ['OPEN', 'UNDER_REVIEW', 'RESOLVED'];

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
const fmtD = (iso) => new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Complaints() {
  const [disputes,    setDisputes]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [chats,       setChats]       = useState([]);
  const [chatInput,   setChatInput]   = useState('');
  const [chatSending, setChatSending] = useState(false);

  // Create modal
  const [showCreate,    setShowCreate]    = useState(false);
  const [transactions,  setTransactions]  = useState([]);
  const [txnLoading,    setTxnLoading]    = useState(false);
  const [createForm,    setCreateForm]    = useState({ transactionId: '', disputeType: '', description: '' });
  const [attachments,   setAttachments]   = useState([]);
  const [creating,      setCreating]      = useState(false);
  const [formError,     setFormError]     = useState('');

  // Tabs
  const [activeTab,     setActiveTab]     = useState('my_complaints'); // 'my_complaints' | 'against_me'

  const currentUser   = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser._id || null;

  const socketRef      = useRef();
  const chatEndRef     = useRef();
  const fileInputRef   = useRef();
  const fetchDisputesRef = useRef(null);

  // ── Socket setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const sock = io(SOCKET_URL);
    socketRef.current = sock;
    sock.on('disputeUpdated', () => fetchDisputesRef.current?.());
    sock.on('disputeMessage', (msg) => {
      // Append to selected dispute's messages array
      setSelectedDispute(prev => prev ? { ...prev, messages: [...(prev.messages || []), msg] } : prev);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    const poll = setInterval(() => fetchDisputesRef.current?.(), 15000);
    return () => { sock.disconnect(); clearInterval(poll); };
  }, []);

  // ── Fetch disputes ────────────────────────────────────────────────────────────
  const fetchDisputes = useCallback(async () => {
    setDisputes([]);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res  = await fetch(`${API_BASE}/disputes/my`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setDisputes([]); return; }
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDisputesRef.current = fetchDisputes; }, [fetchDisputes]);
  useEffect(() => { setDisputes([]); if (currentUserId) fetchDisputes(); }, [currentUserId]);

  // ── Live-sync open modal when list refreshes ─────────────────────────────────
  useEffect(() => {
    if (!selectedDispute) return;
    const fresh = disputes.find(d => d._id === selectedDispute._id);
    if (fresh && fresh.updatedAt !== selectedDispute.updatedAt) setSelectedDispute(fresh);
  }, [disputes]);

  // ── Open dispute → join socket room ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedDispute) return;
    socketRef.current?.emit('joinDispute', selectedDispute._id);
    // Messages are embedded in dispute.messages[] — no separate fetch needed
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
  }, [selectedDispute?._id]);

  // ── Fetch user transactions for create modal ──────────────────────────────────
  const fetchTransactions = async () => {
    if (transactions.length > 0) return;
    setTxnLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      setTransactions(data.transactions || []);
    } catch { toast.error('Failed to load transactions'); }
    finally { setTxnLoading(false); }
  };

  // ── Send chat message ─────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatSending) return;
    const optimistic = { _id: `temp-${Date.now()}`, message: trimmed, senderRole: currentUser.role, createdAt: new Date().toISOString() };
    // Optimistic append to dispute.messages
    setSelectedDispute(prev => prev ? { ...prev, messages: [...(prev.messages || []), optimistic] } : prev);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      setChatSending(true);
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/disputes/${selectedDispute._id}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.message || 'Failed to send'); }
    } catch { toast.error('Failed to send'); }
    finally { setChatSending(false); }
  };

  // ── File handling ─────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) { toast.error('Max 5 files allowed'); return; }
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  // ── Submit complaint ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!createForm.transactionId) { setFormError('Please select a transaction.'); return; }
    if (!createForm.disputeType)   { setFormError('Please select a dispute type.'); return; }
    if (!createForm.description.trim()) { setFormError('Please describe the issue.'); return; }

    setCreating(true);
    try {
      const token    = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('transactionId', createForm.transactionId);
      formData.append('disputeType',   createForm.disputeType);
      formData.append('description',   createForm.description.trim());
      attachments.forEach(f => formData.append('attachments', f));

      const res = await fetch(`${API_BASE}/disputes`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.message || 'Failed to submit.'); return; }

      toast.success('Dispute submitted — admin will review shortly.');
      setShowCreate(false);
      setCreateForm({ transactionId: '', disputeType: '', description: '' });
      setAttachments([]);
      fetchDisputes();
    } catch { setFormError('Server error. Please try again.'); }
    finally { setCreating(false); }
  };

  // ── Timeline helper ───────────────────────────────────────────────────────────
  const currentStepIdx = (status) => {
    if (status === 'REJECTED') return -1;
    return TIMELINE_STEPS.indexOf(status);
  };

  const inputCls = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#22C55E]/50 transition-colors';
  const labelCls = 'text-sm font-medium text-white/70 mb-2 block';

  // ─────────────────────────────────────────────────────────────────────────────
  
  const myComplaints = disputes.filter(d => {
    const rId = typeof d.raisedBy === 'object' ? d.raisedBy?._id : d.raisedBy;
    return String(rId) === String(currentUserId);
  });
  const againstMe = disputes.filter(d => {
    const aId = typeof d.againstUser === 'object' ? d.againstUser?._id : d.againstUser;
    return String(aId) === String(currentUserId);
  });

  const displayedDisputes = activeTab === 'my_complaints' ? myComplaints : againstMe;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold mb-1">Disputes</h1>
          <p className="text-white/50 text-sm">Track disputes linked to your transactions.</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); fetchTransactions(); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] hover:bg-[#16a34a] text-black font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Raise Dispute
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/8 shrink-0 mb-4">
        <button 
          onClick={() => setActiveTab('my_complaints')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'my_complaints' ? 'border-[#22C55E] text-[#22C55E]' : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          My Complaints ({myComplaints.length})
        </button>
        <button 
          onClick={() => setActiveTab('against_me')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'against_me' ? 'border-amber-500 text-amber-500' : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          Against Me ({againstMe.length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayedDisputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-white/10 rounded-2xl text-white/40">
          <HelpCircle className="w-12 h-12 mb-4 opacity-20" />
          <h3 className="font-semibold text-lg text-white/60 mb-1">
            {activeTab === 'my_complaints' ? 'No Complaints Raised' : 'No Complaints Against You'}
          </h3>
          <p className="text-sm">
            {activeTab === 'my_complaints' 
              ? 'You have not raised any disputes.' 
              : 'No disputes have been raised against you.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedDisputes.map(d => (
            <div
              key={d._id}
              onClick={() => setSelectedDispute(d)}
              className={`bg-white/[0.03] border rounded-2xl p-5 transition-all cursor-pointer group ${
                activeTab === 'against_me' 
                  ? 'border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5' 
                  : 'border-white/8 hover:border-[#22C55E]/30 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-white/40 font-medium mb-1 uppercase tracking-wider">
                    {DISPUTE_TYPES.find(t => t.value === d.disputeType)?.icon || '📋'}{' '}
                    {DISPUTE_TYPES.find(t => t.value === d.disputeType)?.label || 'Dispute'}
                  </p>
                  <h3 className={`font-semibold text-sm transition-colors line-clamp-1 ${
                    activeTab === 'against_me' ? 'text-amber-500 group-hover:text-amber-400' : 'text-white group-hover:text-[#22C55E]'
                  }`}>{d.title}</h3>
                </div>
                <StatusBadge status={d.status} />
              </div>

              <div className="mb-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs">
                {activeTab === 'my_complaints' ? (
                  <p className="text-white/60">Against: <span className="font-semibold text-white">{d.againstUser?.fullName || 'Unknown'}</span></p>
                ) : (
                  <p className="text-white/60">Raised by: <span className="font-semibold text-white">{d.raisedBy?.fullName || 'Unknown'}</span></p>
                )}
              </div>

              <p className="text-sm text-white/50 line-clamp-2 mb-4">{d.description}</p>
              <div className="border-t border-white/8 pt-3 flex items-center justify-between text-xs text-white/30">
                <span className="font-mono">
                  {d.transaction?.orderNumber ? `#${d.transaction.orderNumber}` : `#${d.transaction?._id?.slice(-6).toUpperCase() || '—'}`}
                </span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{fmtD(d.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* ── CREATE DISPUTE MODAL ──────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !creating && setShowCreate(false)} />
          <div className="relative bg-[#0A1120] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">

            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#22C55E]/50 to-transparent rounded-t-2xl" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="font-semibold text-white text-sm">Raise a Dispute</h2>
                  <p className="text-xs text-white/40">All disputes must be linked to a transaction</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} disabled={creating} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Transaction selector */}
                <div>
                  <label className={labelCls}>Select Transaction <span className="text-red-400">*</span></label>
                  {txnLoading ? (
                    <div className="flex items-center gap-2 text-white/40 text-sm px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                      <div className="w-4 h-4 border border-white/30 border-t-transparent rounded-full animate-spin" />Loading transactions...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-xl">
                      No transactions found. You can only raise disputes on existing transactions.
                    </div>
                  ) : (
                    <select
                      value={createForm.transactionId}
                      onChange={e => setCreateForm(p => ({ ...p, transactionId: e.target.value }))}
                      className={inputCls + ' appearance-none'}
                      required
                    >
                      <option value="">— Select a transaction —</option>
                      {transactions.map(t => (
                        <option key={t._id} value={t._id} className="bg-[#0A1120]">
                          {t.orderNumber ? `#${t.orderNumber}` : `#${t._id.slice(-6).toUpperCase()}`}
                          {' · '}{t.listing?.paddyType || 'Paddy'}
                          {' · Rs '}{fmt(t.totalAmount)}
                          {' · '}{fmtD(t.createdAt)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Dispute Type */}
                <div>
                  <label className={labelCls}>Dispute Type <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {DISPUTE_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setCreateForm(p => ({ ...p, disputeType: type.value }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all text-left ${
                          createForm.disputeType === type.value
                            ? 'border-[#22C55E]/50 bg-[#22C55E]/10 text-[#22C55E] font-medium'
                            : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <textarea
                    rows={4}
                    value={createForm.description}
                    onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the issue clearly. Include relevant details like quantity received, payment discrepancy, or transport delay..."
                    className={inputCls + ' resize-none'}
                    required
                  />
                </div>

                {/* Evidence upload */}
                <div>
                  <label className={labelCls}>Evidence <span className="text-white/30">(optional, max 5 files)</span></label>
                  <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/30 hover:bg-white/[0.03] hover:border-[#22C55E]/30 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-7 h-7 mb-2 opacity-50" />
                    <p className="text-sm font-medium">Click to upload files</p>
                    <p className="text-xs mt-1 opacity-70">JPG, PNG, PDF — max 10 MB each</p>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-white/[0.03] border border-white/8 rounded-lg">
                          <span className="flex items-center gap-2 text-sm text-white/70 truncate">
                            <Paperclip className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />{file.name}
                          </span>
                          <button type="button" onClick={() => setAttachments(p => p.filter((_, i) => i !== idx))} className="p-1 hover:bg-white/10 rounded text-white/30 hover:text-red-400 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/8">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-3 bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-60 text-black font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/20"
                  >
                    {creating ? 'Submitting…' : 'Submit Dispute'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ── DISPUTE DETAIL MODAL ──────────────────────────────────────────────── */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedDispute(null)} />
          <div className="relative bg-[#0A1120] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-white">
                  {selectedDispute.title || `Dispute #${selectedDispute._id.slice(-6).toUpperCase()}`}
                </h2>
                <StatusBadge status={selectedDispute.status} />
              </div>
              <button onClick={() => setSelectedDispute(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">

              {/* Left column */}
              <div className="lg:w-1/2 space-y-5 flex flex-col">

                {/* Timeline */}
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Progress</p>
                  {selectedDispute.status === 'REJECTED' ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      <X className="w-4 h-4 shrink-0" /> This dispute was rejected by the administrator.
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const cur      = currentStepIdx(selectedDispute.status);
                        const isPassed = idx < cur;
                        const isCurrent = idx === cur;
                        const label = step.replace('_', ' ');
                        return (
                          <div key={step} className="flex-1 flex flex-col items-center relative">
                            {idx !== 0 && (
                              <div className={`absolute top-3.5 left-[-50%] right-[50%] h-[2px] ${isPassed || isCurrent ? 'bg-[#22C55E]' : 'bg-white/10'}`} />
                            )}
                            <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold
                              ${isPassed  ? 'bg-[#22C55E] border-[#22C55E] text-black' :
                                isCurrent ? 'bg-black border-[#22C55E] text-[#22C55E]' :
                                            'bg-black border-white/20 text-white/30'}`}
                            >
                              {isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <span className={`mt-2 text-[10px] font-medium text-center ${isCurrent ? 'text-[#22C55E]' : 'text-white/30'}`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Dispute detail card */}
                <div className="p-4 bg-white/[0.03] border border-white/8 rounded-xl space-y-3">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Dispute Details</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{DISPUTE_TYPES.find(t => t.value === selectedDispute.disputeType)?.icon || '📋'}</span>
                    <span className="text-sm font-semibold text-white">
                      {DISPUTE_TYPES.find(t => t.value === selectedDispute.disputeType)?.label || 'Dispute'}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{selectedDispute.description}</p>
                  <p className="text-xs text-white/30">Filed on {fmtD(selectedDispute.createdAt)}</p>
                </div>

                {/* Transaction reference */}
                {selectedDispute.transaction && (
                  <div className="p-4 bg-white/[0.03] border border-white/8 rounded-xl">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Transaction Reference</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><FileText className="w-3 h-3" />Order #</p>
                        <p className="font-mono text-white font-medium">{selectedDispute.transaction.orderNumber || selectedDispute.transaction._id?.slice(-6).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" />Amount</p>
                        <p className="text-[#22C55E] font-semibold">Rs {fmt(selectedDispute.transaction.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Package className="w-3 h-3" />Paddy Type</p>
                        <p className="text-white">{selectedDispute.transaction.listing?.paddyType || '—'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Package className="w-3 h-3" />Quantity</p>
                        <p className="text-white">{fmt(selectedDispute.transaction.quantityKg)} kg</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resolution message (if closed) */}
                {(selectedDispute.status === 'RESOLVED' || selectedDispute.status === 'REJECTED') && selectedDispute.resolution && (
                  <div className={`p-4 rounded-xl border ${
                    selectedDispute.status === 'RESOLVED'
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-red-500/30 bg-red-500/10'
                  }`}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
                      {selectedDispute.status === 'RESOLVED' ? '✅ Admin Resolution' : '❌ Admin Decision'}
                    </p>
                    <p className="text-sm leading-relaxed">{selectedDispute.resolution}</p>
                    {selectedDispute.resolvedAt && (
                      <p className="text-xs opacity-50 mt-2">Closed on {fmtD(selectedDispute.resolvedAt)}</p>
                    )}
                  </div>
                )}

                {/* Evidence */}
                {selectedDispute.attachments?.length > 0 && (
                  <div className="p-4 bg-white/[0.03] border border-white/8 rounded-xl">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Evidence Files</p>
                    <div className="space-y-2">
                      {selectedDispute.attachments.map(att => (
                        <a key={att._id} href={`http://localhost:5000${att.fileUrl}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 rounded-lg transition-colors group text-sm"
                        >
                          <span className="flex items-center gap-2 text-white/60 group-hover:text-white">
                            <Paperclip className="w-3.5 h-3.5" />{att.fileName}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#22C55E]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info note */}
                <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/8 rounded-xl text-white/40 text-xs">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Disputes are reviewed by administrators. Use the chat to provide additional information.</p>
                </div>
              </div>

              {/* Right column — Chat */}
              <div className="lg:w-1/2 bg-white/[0.02] border border-white/8 rounded-xl flex flex-col min-h-[400px]">
                <div className="p-4 border-b border-white/8 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#22C55E]" />
                  <div>
                    <h3 className="font-semibold text-sm text-white">Case Chat</h3>
                    <p className="text-[10px] text-white/40">Direct messaging with admin team</p>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[360px]">
                  {(!selectedDispute.messages || selectedDispute.messages.length === 0) && (
                    <div className="text-center text-white/30 text-sm mt-8">No messages yet. You can provide additional context here.</div>
                  )}
                  {(selectedDispute.messages || []).map(msg => {
                    const senderIdStr = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                    const isMe    = String(senderIdStr) === String(currentUser._id);
                    const isAdmin = msg.senderRole === 'ADMIN';
                    const senderName = isMe ? 'You' : isAdmin ? 'Administrator' : (msg.sender?.fullName || 'User');
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm ${isMe ? 'bg-[#22C55E] text-black rounded-tr-sm' : isAdmin ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-tl-sm' : 'bg-white/5 border border-white/10 text-white rounded-tl-sm'}`}>
                          <p className={`text-[10px] font-semibold mb-1 ${isMe ? 'text-black/60' : isAdmin ? 'text-amber-500/70' : 'text-[#22C55E]'}`}>
                            {senderName}
                          </p>
                          <p className="leading-relaxed">{msg.message}</p>
                          <p className={`text-[10px] text-right mt-1.5 ${isMe ? 'text-black/50' : 'text-white/30'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {selectedDispute.status !== 'RESOLVED' && selectedDispute.status !== 'REJECTED' ? (
                  <div className="p-3 border-t border-white/8 flex gap-2">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder="Reply to admin..."
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
                      disabled={chatSending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={chatSending || !chatInput.trim()}
                      className="px-4 py-2.5 bg-[#22C55E] hover:bg-[#16a34a] text-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {chatSending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border-t border-white/8 text-center text-white/30 text-xs">
                    This case has been {selectedDispute.status === 'RESOLVED' ? 'resolved' : 'rejected'} and is now closed.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
