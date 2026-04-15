import { useState, useRef } from 'react';
import { X, AlertTriangle, UploadCloud, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api';

const DISPUTE_TYPES = [
  { value: 'QUANTITY_MISMATCH', label: 'Quantity Mismatch', icon: '⚖️', desc: 'Received wrong quantity' },
  { value: 'PAYMENT_ISSUE',     label: 'Payment Issue',     icon: '💳', desc: 'Payment problem or dispute' },
  { value: 'QUALITY_ISSUE',     label: 'Quality Issue',     icon: '🌾', desc: 'Paddy quality not as agreed' },
  { value: 'TRANSPORT_ISSUE',   label: 'Transport Issue',   icon: '🚚', desc: 'Delivery or transport problem' },
];

const fmtMoney = (n) => n ? `Rs ${Number(n).toLocaleString()}` : '—';
const fmtDate  = (iso) => iso ? new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/**
 * RaiseDisputeModal
 * Props:
 *   onClose   — fn to close the modal
 *   onSuccess — fn called after successful submission
 *   preselectedTransaction — (optional) transaction object to pre-fill the dropdown
 *   transactions — (optional) array of transactions for the dropdown; if not passed, modal fetches them
 */
export default function RaiseDisputeModal({ onClose, onSuccess, preselectedTransaction, transactions: propTransactions }) {
  const [transactions,  setTransactions]  = useState(propTransactions || []);
  const [txnLoading,    setTxnLoading]    = useState(!propTransactions);
  const [disputeType,   setDisputeType]   = useState('');
  const [transactionId, setTransactionId] = useState(preselectedTransaction?._id || '');
  const [description,   setDescription]  = useState('');
  const [attachments,   setAttachments]  = useState([]);
  const [submitting,    setSubmitting]   = useState(false);
  const [formError,     setFormError]    = useState('');

  const fileRef = useRef();

  // Fetch transactions if not pre-loaded
  useState(() => {
    if (!propTransactions) {
      const load = async () => {
        setTxnLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res   = await fetch(`${API_BASE}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
          const data  = await res.json();
          setTransactions(data.transactions || []);
        } catch { toast.error('Failed to load transactions'); }
        finally  { setTxnLoading(false); }
      };
      load();
    }
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) { toast.error('Max 5 files'); return; }
    setAttachments(p => [...p, ...files]);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!transactionId) { setFormError('Please select a transaction.'); return; }
    if (!disputeType)   { setFormError('Please select a dispute type.'); return; }
    if (!description.trim()) { setFormError('Please describe the issue.'); return; }

    setSubmitting(true);
    try {
      const token    = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('transactionId', transactionId);
      formData.append('disputeType',   disputeType);
      formData.append('description',   description.trim());
      attachments.forEach(f => formData.append('attachments', f));

      const res  = await fetch(`${API_BASE}/disputes`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.message || 'Submission failed.'); return; }

      toast.success('Dispute raised — our team will review it shortly.');
      onSuccess?.();
      onClose?.();
    } catch { setFormError('Server error. Please try again.'); }
    finally  { setSubmitting(false); }
  };

  const sel = transactions.find(t => t._id === transactionId) || preselectedTransaction;

  const inputCls = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#22C55E]/50 transition-colors';
  const labelCls = 'text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !submitting && onClose?.()} />

      <div className="relative bg-[#0A1120] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Accent line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#22C55E]/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Raise a Dispute</h2>
              <p className="text-[11px] text-white/40">All disputes must be linked to a transaction</p>
            </div>
          </div>
          <button onClick={onClose} disabled={submitting} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">

            {formError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {formError}
              </div>
            )}

            {/* Transaction selector */}
            <div>
              <label className={labelCls}>Transaction <span className="text-red-400">*</span></label>
              {preselectedTransaction ? (
                /* If pre-filled from order page — show as read-only card */
                <div className="p-4 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#22C55E]">Linked Transaction</span>
                    <span className="font-mono text-xs text-white/50">#{preselectedTransaction.orderNumber || preselectedTransaction._id?.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-white/60">
                    <div><span className="text-white/30">Paddy</span><br /><strong className="text-white">{preselectedTransaction.listing?.paddyType || '—'}</strong></div>
                    <div><span className="text-white/30">Qty</span><br /><strong className="text-white">{preselectedTransaction.quantityKg} kg</strong></div>
                    <div><span className="text-white/30">Amount</span><br /><strong className="text-[#22C55E]">{fmtMoney(preselectedTransaction.totalAmount)}</strong></div>
                  </div>
                </div>
              ) : txnLoading ? (
                <div className="flex items-center gap-2 text-white/40 text-sm px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="w-3.5 h-3.5 border border-white/30 border-t-transparent rounded-full animate-spin" />
                  Loading transactions…
                </div>
              ) : transactions.length === 0 ? (
                <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-xl">
                  No transactions found. You can only raise disputes on existing transactions.
                </div>
              ) : (
                <select value={transactionId} onChange={e => setTransactionId(e.target.value)} className={inputCls + ' appearance-none'} required>
                  <option value="">— Select a transaction —</option>
                  {transactions.map(t => (
                    <option key={t._id} value={t._id} className="bg-[#0A1120]">
                      #{t.orderNumber || t._id.slice(-6).toUpperCase()}
                      {' · '}{t.listing?.paddyType || 'Paddy'}
                      {' · '}{fmtMoney(t.totalAmount)}
                      {' · '}{fmtDate(t.createdAt)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Show selected transaction details */}
            {sel && !preselectedTransaction && (
              <div className="p-3 bg-white/[0.03] border border-white/8 rounded-xl grid grid-cols-3 gap-3 text-xs text-white/60">
                <div><span className="text-white/30">Paddy</span><br /><strong className="text-white">{sel.listing?.paddyType || '—'}</strong></div>
                <div><span className="text-white/30">Qty</span><br /><strong className="text-white">{sel.quantityKg} kg</strong></div>
                <div><span className="text-white/30">Amount</span><br /><strong className="text-[#22C55E]">{fmtMoney(sel.totalAmount)}</strong></div>
              </div>
            )}

            {/* Dispute type */}
            <div>
              <label className={labelCls}>Dispute Type <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {DISPUTE_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setDisputeType(type.value)}
                    className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-sm border transition-all text-left ${
                      disputeType === type.value
                        ? 'border-[#22C55E]/50 bg-[#22C55E]/10 text-[#22C55E]'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-base mt-0.5">{type.icon}</span>
                    <div>
                      <p className="font-semibold text-xs">{type.label}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description <span className="text-red-400">*</span></label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue in detail. Include dates, quantities, and any other relevant information…"
                className={inputCls + ' resize-none'}
                required
              />
            </div>

            {/* Evidence */}
            <div>
              <label className={labelCls}>Evidence <span className="text-white/30">(optional, max 5 files)</span></label>
              <input type="file" multiple className="hidden" ref={fileRef} onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center text-white/30 hover:bg-white/[0.03] hover:border-[#22C55E]/30 cursor-pointer transition-colors"
              >
                <UploadCloud className="w-6 h-6 mb-1.5 opacity-50" />
                <p className="text-xs">Click to upload evidence files</p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {attachments.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.03] border border-white/8 rounded-lg">
                      <span className="flex items-center gap-2 text-xs text-white/60"><Paperclip className="w-3 h-3 text-[#22C55E]" />{f.name}</span>
                      <button type="button" onClick={() => setAttachments(p => p.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400 p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2 border-t border-white/8">
              <button
                type="submit"
                disabled={submitting || (!preselectedTransaction && transactions.length === 0)}
                className="w-full py-3 bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-colors shadow-lg shadow-green-500/20"
              >
                {submitting ? 'Submitting…' : 'Submit Dispute'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
