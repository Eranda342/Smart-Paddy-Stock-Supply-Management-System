import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send, CheckCircle2, Building2, Check, CheckCheck, Trash2, Ban, Pencil } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const socket=io("http://localhost:5000");

export default function FarmerNegotiations(){

const [negotiations,setNegotiations]=useState([]);
const [selected,setSelected]=useState(null);
const [message,setMessage]=useState("");
const [counterPrice,setCounterPrice]=useState("");
const [counterQuantity,setCounterQuantity]=useState("");
const [typing,setTyping]=useState(false);
const [onlineUsersMap, setOnlineUsersMap] = useState({});
const [editingMessageId, setEditingMessageId] = useState(null);

const token=localStorage.getItem("token");
const { id } = useParams();
const decodedUser = token ? JSON.parse(atob(token.split('.')[1])) : null;
const bottomRef=useRef(null);

const scrollBottom=()=>{
setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
};

useEffect(() => {
  if (decodedUser) {
    socket.emit("registerUser", decodedUser.id);
  }

  const handleUserOnline = (userId) => setOnlineUsersMap(prev => ({...prev, [userId]: true}));
  const handleUserOffline = (userId) => setOnlineUsersMap(prev => ({...prev, [userId]: false}));

  socket.on("userOnline", handleUserOnline);
  socket.on("userOffline", handleUserOffline);

  return () => {
    socket.off("userOnline", handleUserOnline);
    socket.off("userOffline", handleUserOffline);
  };
}, []);

const markAsRead = async (negotiationId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/negotiations/${negotiationId}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok && decodedUser) {
      socket.emit("markAsRead", { negotiationId, userId: decodedUser.id });
    }
  } catch (err) {}
};

const deleteMessageServer = async (msgId) => {
  if (!selected) return;
  try {
    const res = await fetch(`http://localhost:5000/api/negotiations/${selected._id}/message/${msgId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      socket.emit("deleteMessage", { negotiationId: selected._id, messageId: msgId });
      setSelected(prev => ({
        ...prev,
        messages: prev.messages.map(m => m._id === msgId ? { ...m, isDeleted: true } : m)
      }));
    }
  } catch (err) {}
};

const getMillBusiness=(neg)=>{

if(!neg?.millOwner) return "Rice Mill";

return (
neg.millOwner.businessDetails?.businessName ||
neg.millOwner.fullName ||
"Rice Mill"
);

};

const fetchNegotiations=async()=>{

try{

const res=await fetch("http://localhost:5000/api/negotiations",{
headers:{Authorization:`Bearer ${token}`}
});

const data=await res.json();

if(res.ok){

// farmers only see mill owners
const filtered=data.negotiations.filter(n=>n.millOwner);

setNegotiations(filtered);

if(filtered.length>0){

setSelected(prev=>{
if(prev){
return filtered.find(n=>n._id===prev._id)||filtered[0];
}
return filtered[0];
});

if (!id) {
  socket.emit("joinNegotiation", filtered[0]._id);
}

}

}

}catch(err){console.log(err)}

};

useEffect(() => {

  if (id) {
    // Open specific chat directly
    openConversation(id);
  } else {
    // Load all negotiations normally
    fetchNegotiations();
  }

}, [id]);

useEffect(()=>{

const receiveHandler=(msg)=>{

if(selected && msg.negotiationId===selected._id){

setSelected(prev=>{
  const exists = prev.messages.some(m => m._id === msg.message._id);
  if (exists) return prev;
  return {
    ...prev,
    messages: [...prev.messages, msg.message]
  };
});

scrollBottom();

// Toast for incoming messages (not sent by me)
const senderId = msg.message?.sender?._id || msg.message?.sender;
if (senderId && String(senderId) !== String(decodedUser?.id)) {
  if (msg.message?.type === "COUNTER") {
    toast(`💰 Counter offer: Rs ${msg.message.offeredPrice}/kg`, {
      icon: "🔄",
      style: { background: "#1a1f2e", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }
    });
  } else if (msg.message?.type === "OFFER") {
    toast(`📦 New offer: Rs ${msg.message.offeredPrice}/kg`, {
      icon: "✨",
      style: { background: "#1a1f2e", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }
    });
  } else if (msg.message?.type === "MESSAGE") {
    toast("💬 New message received", {
      style: { background: "#1a1f2e", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }
    });
  }
}

}

};

  const handleMessagesRead = ({ negotiationId, readerId }) => {
    if (selected && selected._id === negotiationId && decodedUser) {
      if (readerId !== decodedUser.id) {
        setSelected(prev => ({
          ...prev,
          messages: prev.messages.map(m => {
            const senderId = m.sender?._id || m.sender;
            if (String(senderId) === decodedUser.id && m.status !== "READ") {
              return { ...m, status: "READ" };
            }
            return m;
          })
        }));
      }
    }
  };

  const handleMessageDeleted = ({ negotiationId, messageId }) => {
    if (selected && selected._id === negotiationId) {
      setSelected(prev => ({
        ...prev,
        messages: prev.messages.map(m => m._id === messageId ? { ...m, isDeleted: true } : m)
      }));
    }
  };

  const handleMessageEdited = ({ negotiationId, messageId, newText }) => {
    if (selected && selected._id === negotiationId) {
      setSelected(prev => ({
        ...prev,
        messages: prev.messages.map(m => m._id === messageId ? { ...m, message: newText, isEdited: true } : m)
      }));
    }
  };

  socket.on("receiveMessage",receiveHandler);
  socket.on("messagesRead", handleMessagesRead);
  socket.on("messageDeleted", handleMessageDeleted);
  socket.on("messageEdited", handleMessageEdited);

  return()=>{
    socket.off("receiveMessage",receiveHandler);
    socket.off("messagesRead", handleMessagesRead);
    socket.off("messageDeleted", handleMessageDeleted);
    socket.off("messageEdited", handleMessageEdited);
  };

},[selected]);

useEffect(()=>scrollBottom(),[selected]);

const openConversation=async(id)=>{

try{

const res=await fetch(`http://localhost:5000/api/negotiations/${id}`,{
headers:{Authorization:`Bearer ${token}`}
});

const data=await res.json();

if(res.ok){

setSelected(data.negotiation);
socket.emit("joinNegotiation",id);
markAsRead(id);

// Check online status of the other user
const otherUserId = data.negotiation.millOwner._id === decodedUser?.id 
  ? data.negotiation.farmer._id 
  : data.negotiation.millOwner._id;
socket.emit("checkOnlineStatus", otherUserId);

}

}catch(err){console.log(err)}

};

const sendMessage=async()=>{

if(!message.trim())return;

if (editingMessageId) {
  try {
    const res = await fetch(`http://localhost:5000/api/negotiations/${selected._id}/message/${editingMessageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ newText: message })
    });
    if (res.ok) {
      socket.emit("editMessage", { negotiationId: selected._id, messageId: editingMessageId, newText: message });
      setSelected(prev => ({
        ...prev,
        messages: prev.messages.map(m => m._id === editingMessageId ? { ...m, message: message, isEdited: true } : m)
      }));
      setMessage("");
      setEditingMessageId(null);
    }
  } catch (err) {}
  return;
}

try{

const res=await fetch(
`http://localhost:5000/api/negotiations/${selected._id}/message`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({message})
}
);

const data=await res.json();

if(res.ok){

const last=data.negotiation.messages[data.negotiation.messages.length-1];

socket.emit("sendMessage",{negotiationId:selected._id,message:last});

setSelected(data.negotiation);
setMessage("");
scrollBottom();

}

}catch(err){console.log(err)}

};

const sendCounterOffer=async()=>{

if(!counterPrice)return;

try{

const payload = {
  message: "Counter Offer",
  offeredPrice: Number(counterPrice)
};

if (counterQuantity) {
  payload.quantityKg = Number(counterQuantity);
}

const res=await fetch(
`http://localhost:5000/api/negotiations/${selected._id}/message`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify(payload)
}
);

const data=await res.json();

if(res.ok){

const last=data.negotiation.messages[data.negotiation.messages.length-1];

socket.emit("sendMessage",{negotiationId:selected._id,message:last});

setSelected(data.negotiation);
setCounterPrice("");
setCounterQuantity("");
scrollBottom();

}

}catch(err){console.log(err)}

};

const updateStatus=async(status)=>{

try{

const endpoint = status === "ACCEPTED" ? "accept" : status === "REJECTED" ? "reject" : "status";

const res=await fetch(
`http://localhost:5000/api/negotiations/${selected._id}/${endpoint}`,
{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({status})
}
);

const data=await res.json();

if(!res.ok){
  alert("Backend Error: " + data.message);
  console.error("Failed to update negotiation status", data);
}

if(res.ok){

setSelected(data.negotiation);
fetchNegotiations();

if (status === "ACCEPTED") {
  toast.success("✅ Negotiation accepted! Transaction created.");
} else if (status === "REJECTED") {
  toast.error("❌ Negotiation rejected.");
}

}

}catch(err){
  console.error("updateStatus error", err);
}

};

const getOffers=()=>{
if(!selected)return[];
return selected.messages.filter(m=>m.offeredPrice);
};

const getLatestQuantity = () => {
  if (!selected) return 0;
  const latestWithQty = selected.messages.slice().reverse().find(m => m.quantityKg);
  return latestWithQty?.quantityKg || selected.listing?.availableQuantityKg || 0;
};

const latestQty = getLatestQuantity();
const availableQty = selected?.listing?.availableQuantityKg || 0;
const isQuantityInvalid = latestQty > availableQty;

return(

<div className="max-w-[1320px] mx-auto">

<div className="mb-8">
<h1 className="text-3xl font-semibold mb-2">Negotiations</h1>
<p className="text-muted-foreground">Chat with rice mill owners</p>
</div>

<div className="grid grid-cols-3 gap-6 h-[calc(100vh-280px)]">

{/* CONVERSATION LIST */}

<div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden min-h-0">

<div className="p-4 border-b border-border font-semibold shrink-0">
Conversations
</div>

<div className="flex-1 overflow-y-auto">

{negotiations.map((neg)=>{

const mill=getMillBusiness(neg);

return(

<button
key={neg._id}
onClick={()=>openConversation(neg._id)}
className={`w-full text-left p-4 border-b border-border hover:bg-muted/40 transition-colors border-l-4
${selected?._id===neg._id ? "bg-[#22C55E]/10 border-l-[#22C55E]" : "border-l-transparent"}`}
>

<div className="flex items-center gap-3">

<div className="w-9 h-9 rounded-full bg-[#22C55E] flex items-center justify-center text-black font-bold">
{mill.charAt(0)}
</div>

<div>

<div className="flex items-center gap-1.5 mb-0.5">

<h3 className="font-medium text-sm truncate">{mill}</h3>

{neg.millOwner?.businessDetails?.businessName && (
  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
)}

</div>

<p className="text-xs text-muted-foreground">
{neg.listing?.paddyType} • {neg.listing?.quantityKg} kg
</p>

</div>

</div>

</button>

);

})}

</div>

</div>

{/* CHAT PANEL */}

<div className="col-span-2 bg-card border border-border rounded-2xl flex flex-col overflow-hidden min-h-0">

{selected ? (

<>

<div className="p-4 border-b border-border flex justify-between">

<div>

<div className="flex items-center gap-2 mb-1">

  <Building2 className="w-5 h-5 text-muted-foreground" />
  <div className="flex flex-col">
    <div className="flex items-center gap-2">
      <h2 className="font-semibold text-lg leading-tight">
        {getMillBusiness(selected)}
      </h2>
      {selected.millOwner?.businessDetails?.businessName && (
        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium border border-blue-500/20">
          <CheckCircle2 className="w-3 h-3" /> VERIFIED MILL
        </span>
      )}
    </div>
    {(() => {
      const otherUserId = selected.millOwner._id === decodedUser?.id ? selected.farmer._id : selected.millOwner._id;
      return onlineUsersMap[otherUserId] ? (
        <span className="text-xs text-[#22C55E] font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse"></span> Online
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Offline</span>
      );
    })()}
  </div>

</div>

<p className="text-xs text-muted-foreground">
{selected.listing?.paddyType} • {selected.listing?.quantityKg} kg
</p>

</div>

<div className="text-xs text-muted-foreground">
Status: {selected.status}
</div>

</div>

{/* PRICE TIMELINE */}

{getOffers().length>0 &&(

<div className="p-4 border-b border-border bg-muted/20">

<h3 className="text-sm font-semibold mb-2">Price Timeline</h3>

<div className="flex gap-2 flex-wrap">

{getOffers().map((offer,i)=>{

const senderId = offer.sender?._id || offer.sender;
const farmerId = selected.farmer?._id || selected.farmer;
const isMe = String(senderId) === String(farmerId);

return(

<div
key={i}
className={`px-3 py-1 border rounded-full text-sm font-medium
${isMe ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"}`}
>
{isMe ? "You" : "Mill"}: Rs {offer.offeredPrice}
</div>

);

})}

</div>

</div>

)}

{/* MESSAGES */}

<div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-0">

{selected.messages.map((msg,i)=>{

const senderId = msg.sender?._id || msg.sender;
const farmerId = selected.farmer?._id || selected.farmer;
const isMe = String(senderId) === String(farmerId);

return(

<div key={i} className={`flex ${isMe?"justify-end":"justify-start"}`}>

<div className={`relative group flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
  <div className={`rounded-2xl px-4 py-2.5 shadow-sm
    ${isMe
      ? msg.type === "COUNTER"
        ? "bg-amber-500 text-black rounded-br-sm"
        : msg.type === "OFFER"
        ? "bg-emerald-500 text-black rounded-br-sm"
        : "bg-[#22C55E] text-black rounded-br-sm"
      : msg.type === "COUNTER"
      ? "bg-amber-500/10 border border-amber-500/20 text-foreground rounded-bl-sm"
      : "bg-[#2A2E33] border border-border text-foreground rounded-bl-sm"
    }`}
  >
    {msg.isDeleted ? (
      <p className={`text-[15px] italic flex items-center gap-1.5 opacity-60 ${isMe ? "text-black" : "text-muted-foreground"}`}>
        <Ban className="w-4 h-4" /> This message was deleted
      </p>
    ) : msg.type === "OFFER" || msg.type === "COUNTER" ? (
      <div>
        <span className={`text-[10px] font-bold tracking-wider uppercase mb-1 block ${isMe ? "text-black/60" : msg.type === "COUNTER" ? "text-amber-500" : "text-[#22C55E]"}`}>
          {msg.type}
        </span>
        <p className="font-semibold text-lg">Rs {msg.offeredPrice} / kg{msg.quantityKg ? ` • ${msg.quantityKg} kg` : ""}</p>
        <p className={`text-sm mt-1 ${isMe ? "text-black/80" : "text-muted-foreground"}`}>{msg.message}</p>
      </div>
    ) : msg.type === "SYSTEM" ? (
      <p className="text-sm font-medium italic opacity-80">{msg.message}</p>
    ) : (
      <p className="text-[15px] leading-relaxed">{msg.message}</p>
    )}
  </div>
  
  <div className={`flex items-center gap-1.5 mt-1.5 font-medium ${isMe ? "mr-1" : "ml-1"}`}>
    <span className="text-[10px] text-muted-foreground flex gap-1 items-center">
      {msg.isEdited && <span className="italic mr-0.5">(edited)</span>}
      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
    </span>
    {isMe && !msg.isDeleted && (
      <span className="inline-flex items-center">
        {msg.status === "READ" ? (
          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
        ) : msg.status === "DELIVERED" ? (
          <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <Check className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </span>
    )}
  </div>

  {/* Delete/Edit Context Action */}
  {isMe && !msg.isDeleted && (
    <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
      {msg.type === "MESSAGE" && (
        <button
          onClick={() => {
            setEditingMessageId(msg._id);
            setMessage(msg.message);
          }}
          className="p-1.5 bg-blue-500/10 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white"
          title="Edit Message"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        onClick={() => deleteMessageServer(msg._id)}
        className="p-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white"
        title="Delete Message"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )}
</div>

</div>

);

})}

<div ref={bottomRef}></div>

</div>

{/* MESSAGE INPUT */}

{selected?.status?.toUpperCase() === "OPEN" && (

<div className="p-4 border-t border-border relative z-10">

{editingMessageId && (
  <div className="absolute top-0 right-4 -translate-y-[120%] bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
    <Pencil className="w-3 h-3" /> Editing message
    <button 
      onClick={() => { setEditingMessageId(null); setMessage(""); }}
      className="text-muted-foreground hover:text-red-500 ml-2"
    >
      Cancel
    </button>
  </div>
)}

<div className="flex gap-2">

<input
value={message}
onChange={(e)=>setMessage(e.target.value)}
onKeyDown={(e)=>{if(e.key==="Enter")sendMessage()}}
placeholder="Type message..."
className="flex-1 px-4 py-3 bg-[#161a20] border border-input rounded-lg"
/>

<button
onClick={sendMessage}
className="px-6 py-3 bg-[#22C55E] text-black rounded-lg"
>
<Send className="w-5 h-5"/>
</button>

</div>

<div className="flex flex-col gap-2 mt-3">

{isQuantityInvalid && (
  <div className="text-red-500 text-[13px] font-medium bg-red-500/10 px-3 py-2 border border-red-500/20 rounded-lg self-start flex items-center gap-1">
    ⚠️ Warning: Negotiated quantity ({latestQty} kg) exceeds available stock. Only {availableQty} kg available!
  </div>
)}

<div className="flex gap-2">

<input
type="number"
placeholder="Counter price"
value={counterPrice}
onChange={(e)=>setCounterPrice(e.target.value)}
className="px-3 py-2 border rounded-lg bg-[#161a20]"
/>

<input
  type="number"
  placeholder={`Qty (max ${availableQty || selected?.listing?.quantityKg || 0} kg)`}
  min="1"
  max={availableQty || selected?.listing?.quantityKg || 1}
  value={counterQuantity}
  onChange={(e) => {
    const val = Number(e.target.value);
    const max = availableQty || selected?.listing?.quantityKg || 0;
    if (val > max && max > 0) {
      setCounterQuantity(String(max));
    } else {
      setCounterQuantity(e.target.value);
    }
  }}
  className="px-3 py-2 border rounded-lg bg-[#161a20]"
/>

<button
onClick={sendCounterOffer}
className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm transition-colors hover:bg-yellow-500/20"
>
Counter Offer
</button>

<button
  disabled={isQuantityInvalid}
  onClick={() => updateStatus("ACCEPTED")}
  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
    isQuantityInvalid 
      ? "bg-red-500/10 text-red-500/50 cursor-not-allowed border border-red-500/10" 
      : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
  }`}
>
Accept
</button>

<button
onClick={()=>updateStatus("REJECTED")}
className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm transition-colors hover:bg-red-500/20"
>
Reject
</button>

</div>
</div>

</div>

)}

</>

):( <div className="flex items-center justify-center h-full">Select conversation</div> )}

</div>

</div>

</div>

);

}