import { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, RefreshCw, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

// Disputes are stored in localStorage as a demo (no backend model yet)
// In production, connect this to a real Dispute model/API
const STORAGE_KEY = 'admin_disputes';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

const StatusBadge = ({ status }) => {
  const map = {
    OPEN: 'text-red-400 bg-red-400/10 border border-red-400/20',
    IN_PROGRESS: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    RESOLVED: 'text-green-400 bg-green-400/10 border border-green-400/20',
  };
  const icons = { OPEN: AlertCircle, IN_PROGRESS: Clock, RESOLVED: CheckCircle };
  const Icon = icons[status] || AlertCircle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ')}
    </span>
  );
};

function DisputeCard({ dispute, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(dispute.adminNote || '');
  const [saving, setSaving] = useState(false);

  const handleStatusChange = (newStatus) => {
    onUpdate(dispute.id, { ...dispute, status: newStatus });
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleSaveNote = () => {
    setSaving(true);
    setTimeout(() => {
      onUpdate(dispute.id, { ...dispute, adminNote: note });
      toast.success('Note saved');
      setSaving(false);
    }, 400);
  };

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${
      dispute.status === 'OPEN' ? 'border-red-400/30' :
      dispute.status === 'IN_PROGRESS' ? 'border-amber-400/30' :
      'border-green-400/20'
    }`}>
      <div
        className="flex items-start justify-between p-5 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-sm">{dispute.subject}</h3>
              <StatusBadge status={dispute.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Reported by <span className="text-foreground font-medium">{dispute.reporter}</span>
              {' · '}{dispute.role}{' · '}{new Date(dispute.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <select
            value={dispute.status}
            onChange={e => { e.stopPropagation(); handleStatusChange(e.target.value); }}
            className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all"
            onClick={e => e.stopPropagation()}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-5 space-y-4 bg-muted/10">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm leading-relaxed">{dispute.description}</p>
          </div>
          {dispute.relatedEntity && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Related</p>
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{dispute.relatedEntity}</span>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin Note</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Add resolution notes..."
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 resize-none transition-all"
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="mt-2 px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const defaultDisputes = [
  {
    id: '1', subject: 'Payment not received after delivery', reporter: 'Saman Perera', role: 'Farmer',
    description: 'I delivered 500kg of paddy on March 20th. The mill owner confirmed delivery but has not made the payment yet. It has been 5 days.',
    status: 'OPEN', relatedEntity: 'Transaction #abc12345', adminNote: '', createdAt: new Date('2026-03-25').toISOString()
  },
  {
    id: '2', subject: 'Wrong paddy type delivered', reporter: 'Golden Rice Mills', role: 'Mill Owner',
    description: 'The farmer listed Keeri Samba but delivered Nadu variety. Quality test confirmed this. Requesting refund or replacement.',
    status: 'IN_PROGRESS', relatedEntity: 'Transaction #def67890', adminNote: 'Contacted farmer, awaiting response', createdAt: new Date('2026-03-23').toISOString()
  },
  {
    id: '3', subject: 'Vehicle driver was rude', reporter: 'Kamal Silva', role: 'Farmer',
    description: 'The assigned driver arrived 3 hours late and was disrespectful during pickup. Requesting action.',
    status: 'RESOLVED', relatedEntity: null, adminNote: 'Driver warned. Compensation offered to farmer.', createdAt: new Date('2026-03-18').toISOString()
  },
];

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultDisputes;
    } catch {
      return defaultDisputes;
    }
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', reporter: '', role: 'Farmer', relatedEntity: '' });

  const saveDisputes = (updated) => {
    setDisputes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleUpdate = (id, updated) => {
    saveDisputes(disputes.map(d => d.id === id ? updated : d));
  };

  const handleAdd = () => {
    if (!form.subject || !form.description || !form.reporter) {
      toast.error('Please fill all required fields');
      return;
    }
    const newDispute = {
      id: Date.now().toString(),
      ...form,
      status: 'OPEN',
      adminNote: '',
      createdAt: new Date().toISOString()
    };
    saveDisputes([newDispute, ...disputes]);
    setForm({ subject: '', description: '', reporter: '', role: 'Farmer', relatedEntity: '' });
    setShowForm(false);
    toast.success('Dispute logged');
  };

  const filtered = disputes.filter(d => !statusFilter || d.status === statusFilter);
  const counts = { OPEN: disputes.filter(d => d.status === 'OPEN').length, IN_PROGRESS: disputes.filter(d => d.status === 'IN_PROGRESS').length, RESOLVED: disputes.filter(d => d.status === 'RESOLVED').length };

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Disputes & Complaints</h1>
          <p className="text-muted-foreground">Review and resolve user-reported issues</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] font-medium rounded-xl transition-colors text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Log New Dispute
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Open', count: counts.OPEN, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', status: 'OPEN' },
          { label: 'In Progress', count: counts.IN_PROGRESS, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', status: 'IN_PROGRESS' },
          { label: 'Resolved', count: counts.RESOLVED, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', status: 'RESOLVED' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => setStatusFilter(statusFilter === s.status ? '' : s.status)}
              className={`bg-card border rounded-2xl p-5 flex items-center gap-4 text-left transition-all ${
                statusFilter === s.status ? 'border-[#22C55E]/50 shadow-[0_0_20px_rgba(34,197,94,0.08)]' : 'border-border hover:border-[#22C55E]/30'
              }`}
            >
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-semibold ${s.color}`}>{s.count}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* New Dispute Form */}
      {showForm && (
        <div className="bg-card border border-[#22C55E]/30 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Log New Dispute</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Reporter name *"
              value={form.reporter}
              onChange={e => setForm({ ...form, reporter: e.target.value })}
              className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all"
            />
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all"
            >
              <option>Farmer</option>
              <option>Mill Owner</option>
            </select>
            <input
              placeholder="Subject *"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="col-span-2 px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all"
            />
            <input
              placeholder="Related entity (e.g. Transaction #abc)"
              value={form.relatedEntity}
              onChange={e => setForm({ ...form, relatedEntity: e.target.value })}
              className="col-span-2 px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all"
            />
            <textarea
              placeholder="Description *"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="col-span-2 px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 resize-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="px-5 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] font-medium rounded-lg text-sm transition-colors">
              Submit Dispute
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-muted hover:bg-muted/70 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Disputes List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-card border border-border rounded-2xl">
            <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
            <p>No disputes found</p>
          </div>
        ) : (
          filtered.map(d => <DisputeCard key={d.id} dispute={d} onUpdate={handleUpdate} />)
        )}
      </div>
    </div>
  );
}
