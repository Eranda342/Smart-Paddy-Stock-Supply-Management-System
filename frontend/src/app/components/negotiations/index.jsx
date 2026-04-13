/**
 * Shared Negotiation UI Components
 * Used by both FarmerNegotiations and MillOwnerNegotiations
 */
import { useState, useRef, useEffect, useMemo, memo } from "react";
import {
  Send, CheckCircle2, User, Building2, Check, CheckCheck, Trash2,
  Ban, Pencil, ChevronDown, ChevronUp, TrendingUp, Clock, Flame,
  MessageSquare, Package, X
} from "lucide-react";
import { Button } from "../ui/button";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export const socket = io("http://localhost:5000");

const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=22C55E&color=fff";
const BASE_URL = "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function statusConfig(status) {
  switch ((status || "").toUpperCase()) {
    case "ACCEPTED":   return { label: "Accepted",  cls: "bg-green-500/10 text-green-400 border-green-500/20" };
    case "REJECTED":   return { label: "Rejected",  cls: "bg-red-500/10 text-red-400 border-red-500/20" };
    case "COMPLETED":  return { label: "Completed", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    default:           return { label: "Open",      cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
  }
}

// ─── ConversationItem ─────────────────────────────────────────────────────────

export const ConversationItem = memo(function ConversationItem({ grp, isSelected, onClick, role }) {
  const latestNeg = grp.listings.reduce((a, b) =>
    new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
  );
  const lastMsg = latestNeg.messages?.[latestNeg.messages.length - 1];
  const preview = lastMsg
    ? lastMsg.isDeleted
      ? "Message deleted"
      : lastMsg.offeredPrice
        ? `Rs ${lastMsg.offeredPrice}/kg offered`
        : lastMsg.message?.slice(0, 40) || "New message"
    : "No messages yet";

  const name = role === "millowner"
    ? (grp.user?.fullName || grp.user?.email || "Farmer")
    : (grp.user?.businessDetails?.businessName || grp.user?.fullName || grp.user?.email || "Mill Owner");

  const openCount = grp.listings.filter(n => n.status === "OPEN").length;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-border/60 transition-all duration-150 border-l-[3px] group
        ${isSelected
          ? "bg-[#22C55E]/8 border-l-[#22C55E]"
          : "border-l-transparent hover:bg-white/[0.03] hover:border-l-[#22C55E]/40"
        }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full shrink-0 overflow-hidden border-2 transition-all ${isSelected ? 'border-[#22C55E]' : 'border-transparent'}`}>
          <img
            src={
              grp.user?.profileImage
                ? `${BASE_URL}/uploads/${grp.user.profileImage}`
                : defaultAvatar
            }
            onError={(e) => { e.target.src = defaultAvatar; }}
            className="w-full h-full object-cover"
            alt={name.charAt(0)}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Time */}
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`font-semibold text-sm truncate ${isSelected ? "text-foreground" : "text-foreground/90"}`}>
                {name}
              </span>
              {grp.user?.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {timeAgo(grp.latestUpdatedAt)}
            </span>
          </div>

          {/* Row 2: Preview + Badge */}
          <div className="flex items-center justify-between gap-1">
            <p className={`text-xs truncate ${isSelected ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
              {preview}
            </p>
            {grp.unreadCount > 0 && !isSelected && (
              <span className="bg-[#22C55E] text-black text-[10px] font-bold w-5 h-5 rounded-full shrink-0 flex items-center justify-center">
                {grp.unreadCount > 9 ? "9+" : grp.unreadCount}
              </span>
            )}
          </div>

          {/* Row 3: Deal count */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Package className="w-2.5 h-2.5" />
              {grp.listings.length} listing{grp.listings.length > 1 ? "s" : ""}
            </span>
            {openCount > 0 && (
              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-500/20">
                {openCount} open
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});

// ─── PriceTimeline ────────────────────────────────────────────────────────────

export const PriceTimeline = memo(function PriceTimeline({ messages, status }) {
  const offers = useMemo(() =>
    (messages || []).filter(m => !m.isDeleted && (m.type === "OFFER" || m.type === "COUNTER") && m.offeredPrice),
    [messages]
  );
  if (offers.length === 0) return null;

  const maxPrice = Math.max(...offers.map(o => o.offeredPrice));
  const minPrice = Math.min(...offers.map(o => o.offeredPrice));

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Price Timeline</span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {offers.map((offer, i) => {
          const isLast = i === offers.length - 1;
          const isAccepted = isLast && status === "ACCEPTED";
          const isHigher = i > 0 && offer.offeredPrice > offers[i - 1].offeredPrice;
          const isLower = i > 0 && offer.offeredPrice < offers[i - 1].offeredPrice;

          return (
            <div key={offer._id || i} className="flex items-center gap-1 shrink-0">
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all
                ${isAccepted
                  ? "bg-green-500 text-black border-green-600 shadow-sm shadow-green-500/30"
                  : isLast
                    ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30"
                    : "bg-card text-muted-foreground border-border"
                }`}
                title={`${offer.type} • ${new Date(offer.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              >
                Rs {offer.offeredPrice}
                {isAccepted && " ✓"}
                {isHigher && <span className="ml-0.5 text-green-400">↑</span>}
                {isLower && <span className="ml-0.5 text-red-400">↓</span>}
              </div>
              {!isLast && <div className="w-4 h-px bg-border/60 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── DealSummary ──────────────────────────────────────────────────────────────

export const DealSummary = memo(function DealSummary({ neg }) {
  const latestPrice = useMemo(() => {
    const offers = (neg.messages || []).filter(m => !m.isDeleted && m.offeredPrice);
    return offers.length > 0 ? offers[offers.length - 1].offeredPrice : null;
  }, [neg.messages]);

  const latestQty = useMemo(() => {
    const qtyMsgs = (neg.messages || []).filter(m => !m.isDeleted && m.quantityKg);
    return qtyMsgs.length > 0 ? qtyMsgs[qtyMsgs.length - 1].quantityKg : neg.listing?.quantityKg;
  }, [neg.messages, neg.listing]);

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <div className="bg-white/[0.03] rounded-lg p-2.5 border border-border/50">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Listed Qty</div>
        <div className="font-semibold text-sm">{neg.listing?.quantityKg || "—"} kg</div>
      </div>
      <div className="bg-white/[0.03] rounded-lg p-2.5 border border-border/50">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Negotiated Qty</div>
        <div className="font-semibold text-sm">{latestQty || "—"} kg</div>
      </div>
      <div className="bg-white/[0.03] rounded-lg p-2.5 border border-border/50">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current Price</div>
        <div className="font-semibold text-sm text-[#22C55E]">
          {latestPrice ? `Rs ${latestPrice}/kg` : "—"}
        </div>
      </div>
    </div>
  );
});

// ─── MessageList ──────────────────────────────────────────────────────────────

export const MessageList = memo(function MessageList({
  messages, decodedUser, onDelete, onEdit, otherUserTyping, roleName, bottomRef
}) {
  const negotiationRounds = useMemo(() => {
    if (!messages) return [];
    const rounds = []; let current = [];
    messages.forEach(msg => {
      current.push(msg);
      if (msg.type === "ACCEPTED" || msg.type === "REJECTED" || msg.type === "CANCELLED") {
        rounds.push(current); current = [];
      }
    });
    if (current.length > 0) rounds.push(current);
    return rounds;
  }, [messages]);

  return (
    <div className="space-y-1 mb-2">
      {negotiationRounds.map((round, rIdx) => (
        <div key={rIdx} className={rIdx < negotiationRounds.length - 1 ? "mb-4 pb-4 border-b border-border/30" : ""}>
          {negotiationRounds.length > 1 && (
            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-border/40 flex-1" />
              <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Round {rIdx + 1}</span>
              <div className="h-px bg-border/40 flex-1" />
            </div>
          )}
          <div className="flex flex-col gap-3">
            {round.map((msg, i) => {
              const isMe = String(msg.sender?._id || msg.sender) === String(decodedUser?.id);
              // System / Status messages
              if (["ACCEPTED", "REJECTED", "CANCELLED"].includes(msg.type)) {
                return (
                  <div key={msg._id || i} className="flex flex-col items-center py-2">
                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${msg.type === "ACCEPTED" ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {msg.type === "ACCEPTED" ? "✓ Deal Accepted" : msg.type === "REJECTED" ? "✗ Offer Rejected" : "Cancelled"}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`relative group flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[78%]`}>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
                      ${isMe
                        ? msg.type === "COUNTER" ? "bg-amber-500 text-black rounded-br-sm"
                          : msg.type === "OFFER" ? "bg-emerald-500 text-black rounded-br-sm"
                          : "bg-[#22C55E] text-black rounded-br-sm"
                        : msg.type === "COUNTER" ? "bg-amber-500/10 border border-amber-500/20 rounded-bl-sm"
                          : "bg-white/[0.06] border border-border/60 rounded-bl-sm"
                      }`}
                    >
                      {msg.isDeleted ? (
                        <p className="italic flex items-center gap-1.5 opacity-50 text-[13px]">
                          <Ban className="w-3.5 h-3.5" /> Deleted
                        </p>
                      ) : (msg.type === "OFFER" || msg.type === "COUNTER") ? (
                        <div>
                          <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 opacity-70`}>
                            {msg.type}
                          </div>
                          <p className="font-bold text-base">Rs {msg.offeredPrice}<span className="font-normal text-xs opacity-80">/kg</span></p>
                          {msg.quantityKg && <p className="text-xs opacity-80 mt-0.5">{msg.quantityKg} kg</p>}
                          {msg.message && msg.message !== "Counter Offer" && msg.message !== "Offer update" && (
                            <p className="text-xs mt-1 opacity-75 border-t border-black/10 pt-1">{msg.message}</p>
                          )}
                        </div>
                      ) : msg.type === "SYSTEM" ? (
                        <p className="text-xs italic opacity-70">{msg.message}</p>
                      ) : (
                        <p>{msg.message}</p>
                      )}
                    </div>

                    {/* Timestamp + read receipt */}
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? "mr-1" : "ml-1"}`}>
                      <span className="text-[10px] text-muted-foreground/60">
                        {msg.isEdited && <span className="italic mr-1">(edited)</span>}
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "just now"}
                      </span>
                      {isMe && !msg.isDeleted && (
                        msg.status === "READ" ? <CheckCheck className="w-3 h-3 text-blue-400" />
                          : msg.status === "DELIVERED" ? <CheckCheck className="w-3 h-3 text-muted-foreground/40" />
                          : <Check className="w-3 h-3 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Hover Actions */}
                    {isMe && !msg.isDeleted && (
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "right-full mr-1.5" : "left-full ml-1.5"} opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1`}>
                        {msg.type === "MESSAGE" && (
                          <button onClick={() => onEdit(msg)} className="p-1 bg-[#1e232b] text-blue-400 rounded-full border border-border/60 hover:bg-blue-500/20 transition-colors">
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => onDelete(msg._id)} className="p-1 bg-[#1e232b] text-red-400 rounded-full border border-border/60 hover:bg-red-500/20 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {otherUserTyping && (
        <div className="flex justify-start">
          <div className="bg-white/[0.06] border border-border/60 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-xs italic text-muted-foreground flex items-center gap-2">
            <span className="flex gap-1">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
            {roleName} is typing…
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
});

// ─── ActionBar ────────────────────────────────────────────────────────────────

export function ActionBar({
  neg, decodedUser, token, fetchNegotiations, roleName
}) {
  const [message, setMessage] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
  const [counterQuantity, setCounterQuantity] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeout = useRef(null);
  const inputRef = useRef(null);

  const availableQty = neg.listing?.availableQuantityKg || 0;
  const latestQtyMsg = (neg.messages || []).slice().reverse().find(m => m.quantityKg);
  const latestQty = latestQtyMsg ? latestQtyMsg.quantityKg : neg.listing?.quantityKg;
  const isQuantityInvalid = latestQty && availableQty > 0 && latestQty > availableQty;

  const emitTyping = (isTyping) => {
    if (!decodedUser) return;
    socket.emit("typing", { negotiationId: neg._id, userId: decodedUser.id, isTyping });
  };

  const onTextChange = (e) => {
    setMessage(e.target.value);
    emitTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleEdit = (msg) => {
    setEditingMessageId(msg._id);
    setMessage(msg.message);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelEdit = () => { setEditingMessageId(null); setMessage(""); };

  const sendMessage = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    emitTyping(false);

    if (editingMessageId) {
      try {
        const res = await fetch(`http://localhost:5000/api/negotiations/${neg._id}/message/${editingMessageId}`, {
          method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ newText: message })
        });
        if (res.ok) {
          socket.emit("editMessage", { negotiationId: neg._id, messageId: editingMessageId, newText: message });
          cancelEdit(); fetchNegotiations();
        }
      } catch (e) {} finally { setIsSending(false); }
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/negotiations/${neg._id}/message`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (res.ok) {
        const last = data.negotiation.messages.at(-1);
        socket.emit("sendMessage", { negotiationId: neg._id, message: last });
        setMessage(""); fetchNegotiations();
      }
    } catch (e) {} finally { setIsSending(false); }
  };

  const sendCounterOffer = async () => {
    if (!counterPrice || isSending) return;
    setIsSending(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    emitTyping(false);
    try {
      const payload = { message: "Counter Offer", offeredPrice: Number(counterPrice) };
      if (counterQuantity) payload.quantityKg = Number(counterQuantity);
      const res = await fetch(`http://localhost:5000/api/negotiations/${neg._id}/message`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        const last = data.negotiation.messages.at(-1);
        socket.emit("sendMessage", { negotiationId: neg._id, message: last });
        setCounterPrice(""); setCounterQuantity(""); fetchNegotiations();
      }
    } catch (e) {} finally { setIsSending(false); }
  };

  const updateStatus = async (status) => {
    try {
      const endpoint = status === "ACCEPTED" ? "accept" : status === "REJECTED" ? "reject" : "status";
      const res = await fetch(`http://localhost:5000/api/negotiations/${neg._id}/${endpoint}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchNegotiations();
        if (status === "ACCEPTED") toast.success("✅ Deal accepted! Transaction created.");
        else if (status === "REJECTED") toast.error("✗ Offer rejected.");
      }
    } catch (e) {}
  };

  // Expose handleEdit to parent via an imperative ref trick isn't needed here—
  // parent passes onEdit callback that calls this.
  // We expose handleEdit through the ActionBar's own rendered button handlers.

  return (
    <div className="border-t border-border/60 bg-[#0d1117]/60 px-4 py-3">
      {/* Edit banner */}
      {editingMessageId && (
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium mb-2">
          <span className="flex items-center gap-1.5"><Pencil className="w-3 h-3" /> Editing message</span>
          <button onClick={cancelEdit} className="hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Text input row */}
      <div className="flex gap-2 mb-2.5">
        <input
          ref={inputRef}
          value={message}
          onChange={onTextChange}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={`Message about ${neg.listing?.paddyType || "this listing"}…`}
          className="flex-1 px-3.5 py-2.5 bg-[#161a20] border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E]/50 focus:border-[#22C55E]/50 transition-all placeholder:text-muted-foreground/40"
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim() || isSending}
          className="w-10 h-10 rounded-xl bg-[#22C55E] text-black flex items-center justify-center shrink-0 hover:bg-[#16a34a] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Counter offer row */}
      <div className="flex flex-wrap items-center gap-2">
        {isQuantityInvalid && (
          <div className="w-full text-red-400 text-[11px] font-medium bg-red-500/8 px-2.5 py-1.5 rounded-lg border border-red-500/20 flex items-center gap-1.5 mb-1">
            ⚠ Qty ({latestQty} kg) exceeds available stock ({availableQty} kg)
          </div>
        )}
        <input
          type="number" min="1"
          max={availableQty || neg.listing?.quantityKg || undefined}
          placeholder={`Qty (max ${availableQty || neg.listing?.quantityKg || "?"})`}
          value={counterQuantity}
          onChange={e => {
            const val = Number(e.target.value);
            const max = availableQty || neg.listing?.quantityKg || 0;
            if (val > max && max > 0) setCounterQuantity(String(max));
            else setCounterQuantity(e.target.value);
          }}
          className="px-2.5 py-1.5 bg-[#161a20] border border-border/60 rounded-lg text-xs w-32 focus:outline-none focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
        />
        <input
          type="number"
          placeholder="Price (Rs/kg)"
          value={counterPrice}
          onChange={e => setCounterPrice(e.target.value)}
          className="px-2.5 py-1.5 bg-[#161a20] border border-border/60 rounded-lg text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
        />
        <button
          onClick={sendCounterOffer}
          disabled={!counterPrice || isSending}
          className="h-7 px-3 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-40"
        >
          Counter
        </button>
        <button
          onClick={() => updateStatus("ACCEPTED")}
          disabled={isQuantityInvalid}
          className="h-7 px-3 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Accept ✓
        </button>
        <button
          onClick={() => updateStatus("REJECTED")}
          className="h-7 px-3 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

// ─── DealCard ─────────────────────────────────────────────────────────────────

export function DealCard({ neg, decodedUser, token, fetchNegotiations, defaultExpanded, isActive, roleName }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
  const bottomRef = useRef(null);
  const actionBarRef = useRef(null);

  const st = statusConfig(neg.status);
  const otherParticipantId = String(decodedUser?.id) === String(neg.farmer?._id || neg.farmer)
    ? (neg.millOwner?._id || neg.millOwner)
    : (neg.farmer?._id || neg.farmer);

  useEffect(() => {
    const handler = ({ negotiationId, userId, isTyping }) => {
      if (negotiationId === neg._id && String(userId) === String(otherParticipantId)) {
        setOtherUserTyping(isTyping);
      }
    };
    socket.on("userTyping", handler);
    return () => socket.off("userTyping", handler);
  }, [neg._id, otherParticipantId]);

  useEffect(() => {
    if (expanded) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 120);
    }
  }, [expanded, neg.messages?.length]);

  // Mark messages as read
  useEffect(() => {
    const unread = decodedUser?.role === "farmer" ? neg.unreadCountFarmer : neg.unreadCountMillOwner;
    if (unread > 0 && expanded) {
      fetch(`http://localhost:5000/api/negotiations/${neg._id}/read`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.ok) socket.emit("markAsRead", { negotiationId: neg._id, userId: decodedUser.id });
      });
    }
  }, [expanded, neg.unreadCountFarmer, neg.unreadCountMillOwner]);

  const deleteMessage = async (msgId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/negotiations/${neg._id}/message/${msgId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        socket.emit("deleteMessage", { negotiationId: neg._id, messageId: msgId });
        fetchNegotiations();
      }
    } catch (e) {}
  };

  const lastMsg = neg.messages?.[neg.messages.length - 1];
  const previewText = lastMsg
    ? lastMsg.isDeleted ? "Message deleted"
      : lastMsg.offeredPrice ? `Rs ${lastMsg.offeredPrice}/kg offered`
      : lastMsg.message?.slice(0, 45) || "—"
    : "No messages yet";

  return (
    <div className={`rounded-2xl border overflow-hidden mb-3 transition-all duration-200
      ${isActive ? "border-[#22C55E]/30 shadow-sm shadow-[#22C55E]/5" : "border-border/50"}`}>

      {/* Card Header */}
      <button
        onClick={() => setExpanded(p => !p)}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors
          ${expanded ? "bg-[#0f1319]" : "bg-[#0a0d12] hover:bg-[#0f1319]"}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e232b] shrink-0">
            <Package className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{neg.listing?.paddyType || "Paddy"}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs">{neg.listing?.quantityKg} kg</span>
              {isActive && (
                <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <Flame className="w-2.5 h-2.5" /> Active
                </span>
              )}
            </div>
            {!expanded && (
              <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{previewText}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.cls}`}>
            {st.label.toUpperCase()}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground/60" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
          }
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="bg-[#060a0e]">
          <div className="px-4 pt-3 pb-2">
            <DealSummary neg={neg} />
            <PriceTimeline messages={neg.messages} status={neg.status} />
          </div>

          {/* Messages */}
          <div className="px-4 pb-2 overflow-y-auto max-h-72 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <MessageList
              messages={neg.messages || []}
              decodedUser={decodedUser}
              onDelete={deleteMessage}
              onEdit={(msg) => {
                setEditingMsg(msg);
                // pass down to ActionBar via re-render
              }}
              otherUserTyping={otherUserTyping}
              roleName={roleName}
              bottomRef={bottomRef}
            />
          </div>

          {/* Action bar — only when OPEN */}
          {neg.status?.toUpperCase() === "OPEN" ? (
            <ActionBar
              neg={neg}
              decodedUser={decodedUser}
              token={token}
              fetchNegotiations={fetchNegotiations}
              roleName={roleName}
              ref={actionBarRef}
            />
          ) : (
            <div className={`px-4 py-3 text-xs text-center border-t border-border/40 text-muted-foreground/60 italic`}>
              {neg.status === "ACCEPTED" && "✓ Deal accepted — no further actions available"}
              {neg.status === "REJECTED" && "✗ Offer rejected — please start a new negotiation from the listing"}
              {neg.status === "COMPLETED" && "Deal completed — read only"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
