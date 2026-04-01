import { useState, useEffect, useCallback, useRef } from 'react';
import { HelpCircle, CheckCircle, Clock, MessageSquare, Plus, X, List, Info, ArrowUpRight, UploadCloud, Paperclip } from 'lucide-react';
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

export default function Complaints() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // Create Modal state
  const [showCreateWrapper, setShowCreateWrapper] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [createForm, setCreateForm] = useState({ title: '', description: '', transactionId: '' });
  const [attachments, setAttachments] = useState([]);
  const [creating, setCreating] = useState(false);

  // Sockets
  const socketRef = useRef();
  const chatEndRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('disputeUpdated', () => { fetchDisputes(); });
    socketRef.current.on('newMessage', (msg) => {
      setChats(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => socketRef.current.disconnect();
  }, []);

  const fetchDisputes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/disputes/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = async () => {
    if (transactions.length > 0) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch {
      toast.error('Failed to load transactions');
    }
  };

  const fetchChats = async (did) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/chat/${did}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setChats(data);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      toast.error('Failed to load chat history');
    }
  };

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  useEffect(() => {
    if (selectedDispute) {
       socketRef.current.emit('joinDispute', selectedDispute._id);
       fetchChats(selectedDispute._id);
       
       const fresh = disputes.find(d => d._id === selectedDispute._id);
       if (fresh && fresh.updatedAt !== selectedDispute.updatedAt) {
          setSelectedDispute(fresh);
       }
    }
  }, [selectedDispute, disputes]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/chat/${selectedDispute._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: chatInput })
      });
      setChatInput('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) {
      toast.error("You can only upload up to 5 files.");
      return;
    }
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append("title", createForm.title);
      formData.append("description", createForm.description);
      if (createForm.transactionId) formData.append("transactionId", createForm.transactionId);
      
      attachments.forEach(file => {
        formData.append("attachments", file);
      });

      const res = await fetch(`${API_BASE}/disputes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // FormData automatically sets content-type multipart
        body: formData
      });
      
      if (!res.ok) throw new Error();
      toast.success("Complaint submitted for admin review.");
      setShowCreateWrapper(false);
      setCreateForm({ title: '', description: '', transactionId: '' });
      setAttachments([]);
      fetchDisputes();
    } catch {
      toast.error("Failed to submit complaint.");
    } finally {
      setCreating(false);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">My Complaints</h1>
          <p className="text-muted-foreground">Track ongoing disputes and contact platform administrators.</p>
        </div>
        <button
          onClick={() => { setShowCreateWrapper(true); fetchTransactions(); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-background font-medium rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Raise a Complaint
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center h-48 items-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl text-muted-foreground bg-card">
          <HelpCircle className="w-10 h-10 mb-4 opacity-20" />
          <h3 className="font-semibold text-lg text-foreground mb-1">No Complaints Logged</h3>
          <p className="text-sm">You haven't opened any dispute cases with administration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disputes.map(d => (
            <div key={d._id} onClick={() => setSelectedDispute(d)} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group flex flex-col">
               <div className="flex justify-between items-start mb-4 gap-4">
                 <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{d.title}</h3>
                 <StatusBadge status={d.status} />
               </div>
               <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{d.description}</p>
               {d.attachments && d.attachments.length > 0 && (
                 <div className="flex items-center gap-2 mb-3 text-xs text-primary font-medium">
                   <Paperclip className="w-3.5 h-3.5" />
                   {d.attachments.length} file(s) attached
                 </div>
               )}
               <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground font-medium">
                  {d.transaction ? <span>Txn #{d.transaction._id.substring(0,6)}</span> : <span>General</span>}
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(d.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COMPLAINT MODAL */}
      {showCreateWrapper && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
               <h2 className="text-xl font-semibold flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-primary" /> Submit Case Report</h2>
               <button onClick={() => setShowCreateWrapper(false)} className="p-2 hover:bg-muted rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto w-full p-6" style={{scrollbarWidth: 'thin'}}>
              <form onSubmit={handleSubmitComplaint} className="space-y-5">
                
                <div>
                  <label className="text-sm font-semibold mb-2 block">Case Issue Name</label>
                  <input required value={createForm.title} onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Delayed Delivery, Product Quality Issue" className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Link Transaction (Optional)</label>
                  <select value={createForm.transactionId} onChange={e => setCreateForm(prev => ({ ...prev, transactionId: e.target.value }))} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors">
                     <option value="">None / General Issue</option>
                     {transactions.map(t => (
                        <option key={t._id} value={t._id}>
                          {t._id.substring(0,8)} - {t.listing?.paddyType} - {t.totalAmount}LKR ({t.status})
                        </option>
                     ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Description of Incident</label>
                  <textarea required rows={5} value={createForm.description} onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Please explain the issue accurately for the administration team to review..." className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Supporting Evidence (Max 5 files)</label>
                  
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-5 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">Click to upload files</p>
                    <p className="text-xs mt-1 opacity-70">JPG, PNG, PDF up to 10MB each</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex flex-row items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Paperclip className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <button type="button" onClick={() => removeAttachment(idx)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <button type="submit" disabled={creating} className="w-full py-3.5 bg-primary hover:bg-primary/90 font-semibold text-background rounded-xl disabled:opacity-50 transition-colors shadow-sm shadow-primary/20">
                    {creating ? 'Submitting to Admin...' : 'Open Formal Case & Attach Evidence'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE DETAILS & CHAT MODAL */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Case Overview #{selectedDispute._id.substring(0, 8)}</h2>
                <StatusBadge status={selectedDispute.status} />
              </div>
              <button onClick={() => setSelectedDispute(null)} className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
                  Close X
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
              
              <div className="lg:w-1/2 space-y-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-5">Admin Progress</h3>
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
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Transaction Identity</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-muted-foreground text-xs mb-1">Txn ID</p><p className="font-mono bg-muted inline-flex px-1.5 rounded">#{selectedDispute.transaction._id.substring(0,8)}</p></div>
                      <div><p className="text-muted-foreground text-xs mb-1">Total Amount</p><p className="font-semibold">Rs {selectedDispute.transaction.totalAmount}</p></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl text-primary/80">
                  <Info className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-xs leading-relaxed font-medium">As a user, you cannot manually alter the state of this ticket. Administration will process it securely. Use the chat module directly to communicate with an admin rep if you need to provide further context.</p>
                </div>

              </div>

              {/* CHAT COL */}
              <div className="lg:w-1/2 bg-card border border-border rounded-xl flex flex-col shadow-sm max-h-[100%]">
                 <div className="p-4 border-b border-border bg-muted/20 flex gap-2 items-center">
                     <MessageSquare className="w-5 h-5 text-primary" />
                     <div>
                       <h3 className="font-semibold text-sm">Escalation Room</h3>
                       <p className="text-xs text-muted-foreground">Direct communication to resolution team.</p>
                     </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto bg-muted/5 space-y-4" style={{scrollbarWidth: 'thin'}}>
                    {chats.length === 0 && <div className="text-center text-sm text-muted-foreground mt-10">You can supply further information to administration here.</div>}
                    {chats.map(msg => {
                      const isMe = msg.senderId?._id === currentUser._id || msg.senderId === currentUser._id;
                      const isAdmin = msg.senderRole === "ADMIN";
                      
                      const bubbleColor = isMe ? 'bg-primary text-[#0F1115] rounded-tr-sm' : (isAdmin ? 'bg-rose-500 text-white rounded-tl-sm' : 'bg-muted text-foreground rounded-tl-sm');
                      
                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl p-4 ${bubbleColor}`}>
                             <div className="flex justify-between items-end gap-4 mb-2">
                               <span className={`text-xs font-semibold ${isMe ? 'text-[#0F1115]/80' : 'text-white/80'}`}>{isMe ? "You" : (isAdmin ? "Administration" : "User")}</span>
                             </div>
                             <p className="text-sm leading-relaxed">{msg.message}</p>
                             <div className={`text-[10px] text-right mt-2 ${isMe ? 'text-[#0F1115]/60' : 'text-foreground/50'}`}>
                               {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {selectedDispute.status !== 'CLOSED' ? (
                     <div className="p-3 border-t border-border bg-card">
                       <input 
                          value={chatInput} 
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Reply to administration..."
                          className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                       />
                     </div>
                  ) : (
                     <div className="p-4 border-t border-border bg-muted/30 text-center text-sm text-muted-foreground font-medium">
                        This issue has been archived explicitly.
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
