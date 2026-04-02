import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle, Clock, User, MessageSquare, PackageOpen, HelpCircle, CornerDownRight, Zap, Send, Paperclip, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const STAGES = ['OPEN', 'REVIEW', 'INVESTIGATION', 'RESOLUTION', 'CLOSED'];

const StatusBadge = ({ status }) => {
  const map = {
    OPEN: 'text-red-400 bg-red-400/10 border-red-400/20',
    REVIEW: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    INVESTIGATION: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    RESOLUTION: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    CLOSED: 'text-green-400 bg-green-400/10 border-green-400/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${map[status] || map.OPEN}`}>
      {(status || 'OPEN').replace('_', ' ')}
    </span>
  );
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastOpenedDisputeId, setLastOpenedDisputeId] = useState(null);

  const socketRef = useRef();
  const chatEndRef = useRef();
  // Ref so socket callbacks always call the LATEST fetchDisputes (avoids stale closure)
  const fetchDisputesRef = useRef(null);

  const fetchDisputes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/disputes`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep ref updated so socket handlers always use latest version
  useEffect(() => { fetchDisputesRef.current = fetchDisputes; }, [fetchDisputes]);

  // ── Socket setup (AFTER fetchDisputes is defined) ──
  useEffect(() => {
    const sock = io(SOCKET_URL);
    socketRef.current = sock;

    sock.on('connect', () => setSocketConnected(true));
    sock.on('disconnect', () => setSocketConnected(false));
    if (sock.connected) setSocketConnected(true);

    // Use ref so these always call the latest fetchDisputes — no stale closure
    sock.on('disputeUpdated', () => fetchDisputesRef.current?.());
    sock.on('dashboard_update', () => fetchDisputesRef.current?.());

    sock.on('newMessage', (msg) => {
      setChats(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // 15-second polling fallback in case socket events are missed
    const poll = setInterval(() => fetchDisputesRef.current?.(), 15000);

    return () => {
      sock.disconnect();
      clearInterval(poll);
    };
  }, []);

  const fetchChats = useCallback(async (did) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/chat/${did}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setChats(Array.isArray(data) ? data : []);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      toast.error('Failed to load chat history');
    }
  }, []);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  // Effect 1: When a dispute is OPENED — join its socket room and load chat
  useEffect(() => {
    if (!selectedDispute) return;
    setChats([]);
    if (socketRef.current) socketRef.current.emit('joinDispute', selectedDispute._id);
    fetchChats(selectedDispute._id);
  }, [selectedDispute?._id, fetchChats]);

  // Effect 2: Live-sync open modal metadata when the disputes list refreshes
  useEffect(() => {
    if (!selectedDispute || actionLoading) return;
    const fresh = disputes.find(d => d._id === selectedDispute._id);
    if (fresh && fresh.updatedAt !== selectedDispute.updatedAt) {
      setSelectedDispute(fresh);
    }
  }, [disputes]);

  // ── Open / close helpers ──
  const openDispute = (d) => {
    setSelectedDispute(d);
    setChats([]);
    setNoteInput('');
    setChatInput('');
  };

  const closeDispute = () => {
    setSelectedDispute(null);
    setChats([]);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedDispute) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/admin/disputes/${selectedDispute._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDisputes(); // Socket covers others, we force ours so it updates instantly
      toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update stage');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/admin/disputes/${selectedDispute._id}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: noteInput })
      });
      setNoteInput('');
      fetchDisputes();
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  const handeSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatSending) return;

    // Optimistic UI — show message immediately
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      message: trimmed,
      senderRole: 'ADMIN',
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setChats(prev => [...prev, optimisticMsg]);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      setChatSending(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/chat/${selectedDispute._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: trimmed })
      });
      if (!res.ok) {
        const err = await res.json();
        // Remove optimistic message on failure
        setChats(prev => prev.filter(m => m._id !== optimisticMsg._id));
        toast.error(err.message || 'Failed to send message');
      }
      // Real message will arrive via socket 'newMessage' event — remove optimistic duplicate
      setChats(prev => prev.filter(m => m._id !== optimisticMsg._id));
    } catch {
      setChats(prev => prev.filter(m => m._id !== optimisticMsg._id));
      toast.error('Failed to send message');
    } finally {
      setChatSending(false);
    }
  };

  const filtered = disputes.filter(d => !statusFilter || d.status === statusFilter);

  return (
    <div className="max-w-[1320px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Case Management</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Step-by-step dispute resolution system 
            {socketConnected && <span className="inline-flex w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" title="Live sync active" />}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STAGES.map(stage => {
          const count = disputes.filter(d => d.status === stage).length;
          const isActive = statusFilter === stage;
          return (
            <button
              key={stage}
              onClick={() => setStatusFilter(isActive ? '' : stage)}
              className={`bg-card border rounded-2xl p-5 text-left transition-all ${
                isActive ? 'border-primary/50 shadow-sm' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="text-xs text-muted-foreground font-medium mb-1 truncate">{stage.replace('_', ' ')}</div>
              <div className="text-2xl font-semibold">{count}</div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center h-48 items-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl text-muted-foreground">
          <HelpCircle className="w-8 h-8 mb-2 opacity-30" />
          <p>No cases found matching criteria.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Case Title</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Reporter</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Stage</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Date Logged</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 font-medium flex items-center gap-2">
                    {d.autoGenerated && <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" title="Automated System Alert" />}
                    {d.title}
                    {d.attachments && d.attachments.length > 0 && (
                      <Paperclip className="w-3.5 h-3.5 text-primary ml-1 shrink-0" title="Contains attachments" />
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-foreground">{d.reporter ? d.reporter.fullName : 'System (Automated)'}</div>
                    {d.reporter && <div className="text-xs text-primary capitalize">{d.reporter?.role?.replace('_', ' ').toLowerCase()}</div>}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-4 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openDispute(d)} className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Manage Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Case #{selectedDispute._id.substring(0, 8).toUpperCase()}</h2>
                <StatusBadge status={selectedDispute.status} />
                {selectedDispute.autoGenerated && (
                   <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-xs font-semibold uppercase tracking-wider border border-amber-500/20">
                     <Zap className="w-3 h-3 fill-amber-500" /> Automated Trigger
                   </span>
                )}
              </div>
              <button onClick={closeDispute} className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
                  Close X
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6" style={{ scrollbarWidth: 'thin' }}>
              
              <div className="lg:w-2/3 space-y-6 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-5">Workflow</h3>
                  <div className="flex items-center w-full">
                    {STAGES.map((stage, idx) => {
                      const currentIdx = STAGES.indexOf(selectedDispute.status);
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={stage} className="flex-1 flex flex-col items-center relative">
                          {idx !== 0 && <div className={`absolute top-4 left-[-50%] right-[50%] h-[2px] ${isCompleted || isCurrent ? 'bg-primary' : 'bg-muted'}`} />}
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold
                            ${isCompleted ? 'bg-primary border-primary text-[#0F1115]' : isCurrent ? 'bg-background border-primary text-primary' : 'bg-muted border-transparent text-muted-foreground'}
                          `}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : (idx + 1)}
                          </div>
                          <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-lg mb-1">{selectedDispute.title}</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{selectedDispute.description}</p>
                </div>

                {selectedDispute.attachments && selectedDispute.attachments.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Attached Evidence</h3>
                    <div className="space-y-2">
                       {selectedDispute.attachments.map(att => (
                          <a 
                            key={att._id} 
                            href={`http://localhost:5000${att.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted border border-border rounded-lg transition-colors group"
                          >
                            <span className="flex items-center gap-3 text-sm font-medium group-hover:text-primary transition-colors">
                              <Paperclip className="w-4 h-4" />
                              {att.fileName}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </a>
                       ))}
                    </div>
                  </div>
                )}

                {selectedDispute.transaction && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Transaction Reference</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-muted-foreground text-xs mb-1">Txn ID</p><p className="font-mono bg-muted inline-flex px-1.5 rounded">#{selectedDispute.transaction._id.substring(0,8)}</p></div>
                      <div><p className="text-muted-foreground text-xs mb-1">Amount</p><p className="font-semibold">Rs {selectedDispute.transaction.totalAmount}</p></div>
                      <div><p className="text-muted-foreground text-xs mb-1">Paddy Type</p><p>{selectedDispute.transaction.listing?.paddyType || '—'}</p></div>
                      <div><p className="text-muted-foreground text-xs mb-1">Quantity</p><p>{selectedDispute.transaction.quantityKg} kg</p></div>
                    </div>
                  </div>
                )}

                {/* Secure Chat Module */}
                <div className="flex-1 bg-card border border-border rounded-xl flex flex-col shadow-sm min-h-[300px]">
                  <div className="p-4 border-b border-border bg-muted/20 flex gap-2 items-center">
                     <MessageSquare className="w-4 h-4 text-primary" />
                     <h3 className="font-semibold text-sm">Case Discussion</h3>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto bg-muted/5 space-y-4 max-h-[300px]">
                    {chats.length === 0 && <div className="text-center text-sm text-muted-foreground mt-10">No messages yet.</div>}
                    {chats.map(msg => {
                      const isAdmin = msg.senderRole === "ADMIN";
                      const roleTag = isAdmin ? "Administrator" : (msg.senderRole?.replace('_', ' ') || "System");
                      return (
                        <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl p-4 ${isAdmin ? 'bg-primary text-[#0F1115] rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                             <div className="flex justify-between items-end gap-4 mb-2">
                               <span className={`text-xs font-semibold ${isAdmin ? 'text-[#0F1115]/80' : 'text-primary uppercase'}`}>{roleTag}</span>
                             </div>
                             <p className="text-sm leading-relaxed">{msg.message}</p>
                             <div className={`text-[10px] text-right mt-2 ${isAdmin ? 'text-[#0F1115]/60' : 'text-muted-foreground'}`}>
                               {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="p-3 border-t border-border bg-card flex gap-2">
                    <input 
                       value={chatInput} 
                       onChange={e => setChatInput(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handeSendMessage(); }}}
                       placeholder="Type your message..."
                       className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                       disabled={chatSending}
                    />
                    <button 
                      onClick={handeSendMessage} 
                      disabled={chatSending || !chatInput.trim()}
                      className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-background rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {chatSending 
                        ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* ACTION ENGINE COL */}
              <div className="lg:w-1/3 flex flex-col gap-6">
                
                <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
                   <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Reporter Profile</h3>
                   {selectedDispute.autoGenerated ? (
                     <div className="text-sm text-foreground space-y-2">
                       <Zap className="w-6 h-6 text-amber-500 fill-amber-500 mb-2" />
                       <p className="font-medium">System Sentinel (Automated)</p>
                       <p className="text-muted-foreground text-xs leading-relaxed">This case was automatically flagged by backend monitors tracing delayed transactional logistics.</p>
                     </div>
                   ) : (
                     <div className="text-sm">
                        <p className="font-medium text-base mb-1">{selectedDispute.reporter?.fullName}</p>
                        <p className="text-primary text-xs font-semibold uppercase mb-2">{selectedDispute.reporter?.role?.replace('_', ' ')}</p>
                        <p className="text-muted-foreground">{selectedDispute.reporter?.email}</p>
                     </div>
                   )}
                </div>

                <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-[0_0_20px_rgba(34,197,94,0.05)]">
                  <h3 className="font-semibold text-sm uppercase mb-4 tracking-wider text-muted-foreground">Stage Actions</h3>

                  {selectedDispute.status === 'OPEN' && (
                    <button onClick={() => handleUpdateStatus('REVIEW')} disabled={actionLoading} className="w-full py-2.5 bg-primary hover:bg-primary/90 text-background rounded-lg font-medium text-sm disabled:opacity-50 transition-colors">
                      Acknowledge & Start Review
                    </button>
                  )}

                  {selectedDispute.status === 'REVIEW' && (
                    <div className="space-y-3">
                      <button onClick={() => handleUpdateStatus('INVESTIGATION')} disabled={actionLoading} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-colors">
                        Commence Investigation
                      </button>
                      <button onClick={() => handleUpdateStatus('CLOSED')} disabled={actionLoading} className="w-full py-2.5 bg-muted hover:bg-muted/70 rounded-lg text-sm disabled:opacity-50 transition-colors">
                        Dismiss Case Early
                      </button>
                    </div>
                  )}

                  {selectedDispute.status === 'INVESTIGATION' && (
                     <div className="space-y-4">
                       <div className="space-y-2">
                         <textarea
                           value={noteInput}
                           onChange={e => setNoteInput(e.target.value)}
                           placeholder="Log investigation finding..."
                           className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground resize-none h-20 focus:outline-none focus:border-primary/50"
                         />
                         <button onClick={handleAddNote} disabled={!noteInput.trim() || actionLoading} className="w-full py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold transition-colors">
                           Append Confidential Note
                         </button>
                       </div>
                       <div className="border-t border-border pt-4">
                         <button onClick={() => handleUpdateStatus('RESOLUTION')} disabled={actionLoading} className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors">
                           Move to Resolution
                         </button>
                       </div>
                     </div>
                  )}

                  {selectedDispute.status === 'RESOLUTION' && (
                     <div className="space-y-3">
                       <button onClick={() => handleUpdateStatus('CLOSED')} disabled={actionLoading} className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors">
                         Finalize Settlement & Close
                       </button>
                     </div>
                  )}

                  {selectedDispute.status === 'CLOSED' && (
                     <div className="text-center text-sm text-foreground py-2 font-medium">
                       <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                       Case Successfully Resolved
                     </div>
                  )}
                </div>
                
                {/* Confidential Investigation Notes */}
                {(selectedDispute.status !== 'OPEN' && selectedDispute.notes && selectedDispute.notes.length > 0) && (
                   <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                     <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Action Log</h3>
                     <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin'}}>
                        {selectedDispute.notes.map((n, i) => (
                          <div key={i} className="flex gap-3">
                            <CornerDownRight className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                               <p className="text-xs font-semibold text-foreground mb-0.5">{n.message}</p>
                               <p className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                     </div>
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
