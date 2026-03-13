import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function FarmerNegotiations() {

const [negotiations,setNegotiations]=useState([]);
const [selected,setSelected]=useState(null);
const [message,setMessage]=useState("");
const [counterPrice,setCounterPrice]=useState("");
const [unread,setUnread]=useState({});

const bottomRef=useRef(null);
const token=localStorage.getItem("token");

const scrollToBottom=()=>{
setTimeout(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},100);
};

const getOfferHistory=()=>{
if(!selected) return [];
return selected.messages.filter(msg=>msg.offeredPrice);
};

const fetchNegotiations=async()=>{

try{

const res=await fetch("http://localhost:5000/api/negotiations",{
headers:{Authorization:`Bearer ${token}`}
});

const data=await res.json();

if(res.ok){

setNegotiations(data.negotiations);

if(data.negotiations.length>0){

setSelected(data.negotiations[0]);
socket.emit("joinNegotiation",data.negotiations[0]._id);

}

}

}catch(err){console.error(err)}

};

useEffect(()=>{fetchNegotiations()},[]);

useEffect(()=>{

socket.on("receiveMessage",(msg)=>{

if(selected && msg.negotiationId===selected._id){

setSelected(prev=>({...prev,messages:[...prev.messages,msg]}));
scrollToBottom();

}else{

setUnread(prev=>({...prev,[msg.negotiationId]:true}));

}

});

return()=>socket.off("receiveMessage");

},[selected]);

useEffect(()=>{scrollToBottom()},[selected]);

const openConversation=async(id)=>{

try{

const res=await fetch(`http://localhost:5000/api/negotiations/${id}`,{
headers:{Authorization:`Bearer ${token}`}
});

const data=await res.json();

if(res.ok){

setSelected(data.negotiation);
socket.emit("joinNegotiation",id);

setUnread(prev=>{
const copy={...prev};
delete copy[id];
return copy;
});

scrollToBottom();

}

}catch(err){console.error(err)}

};

const sendMessage=async()=>{

if(!message.trim()) return;

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
scrollToBottom();

}

}catch(err){console.error(err)}

};

const sendCounterOffer=async()=>{

if(!counterPrice) return;

try{

const res=await fetch(
`http://localhost:5000/api/negotiations/${selected._id}/message`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
message:"Counter offer",
offeredPrice:counterPrice
})
}
);

const data=await res.json();

if(res.ok){

const last=data.negotiation.messages[data.negotiation.messages.length-1];

socket.emit("sendMessage",{negotiationId:selected._id,message:last});

setSelected(data.negotiation);
setCounterPrice("");
scrollToBottom();

}

}catch(err){console.error(err)}

};

const updateStatus=async(status)=>{

try{

const res=await fetch(
`http://localhost:5000/api/negotiations/${selected._id}/status`,
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

if(res.ok){setSelected(data.negotiation)}

}catch(err){console.error(err)}

};

return(

<div className="max-w-[1320px] mx-auto">

<div className="mb-8">
<h1 className="text-3xl font-semibold mb-2">Negotiations</h1>
<p className="text-muted-foreground">Chat with rice mill owners</p>
</div>

<div className="grid grid-cols-3 gap-6 h-[calc(100vh-280px)]">

{/* Conversations */}

<div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">

<div className="p-4 border-b border-border">
<h2 className="font-semibold">Conversations</h2>
</div>

<div className="flex-1 overflow-y-auto">

{negotiations.map((neg)=>{

const active=selected?._id===neg._id;

return(

<button
key={neg._id}
onClick={()=>openConversation(neg._id)}
className={`w-full p-4 border-b border-border text-left transition-all
${active?"bg-[#22C55E]/10 border-l-4 border-[#22C55E]":"hover:bg-muted/50"}
`}
>

<div className="flex justify-between items-center">

<div className="flex items-center gap-3">

<div className="w-9 h-9 rounded-full bg-[#22C55E] flex items-center justify-center text-black font-bold">
{neg.millOwner?.name?.charAt(0)||"M"}
</div>

<div>
<h3 className="font-medium">{neg.millOwner?.name||"Mill Owner"}</h3>
<p className="text-xs text-muted-foreground">
{neg.listing?.paddyType} • {neg.listing?.quantityKg} kg
</p>
</div>

</div>

{unread[neg._id]&&(
<div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
)}

</div>

</button>

);

})}

</div>

</div>

{/* Chat */}

<div className="col-span-2 bg-card border border-border rounded-2xl flex flex-col">

{selected ? (

<>

<div className="p-4 border-b border-border flex justify-between items-center">

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center text-black font-bold">
{selected.millOwner?.name?.charAt(0)}
</div>

<div>
<h2 className="font-semibold text-lg">{selected.millOwner?.name}</h2>
<p className="text-xs text-muted-foreground">
{selected.listing?.paddyType} • {selected.listing?.quantityKg} kg
</p>
</div>

</div>

<div className="text-xs text-muted-foreground">
Status: {selected.status}
</div>

</div>

{/* Price Timeline */}

{getOfferHistory().length>0 &&(

<div className="p-4 border-b border-border bg-muted/20">

<h3 className="text-sm font-semibold mb-2">Price Negotiation Timeline</h3>

<div className="flex flex-wrap gap-2">

{getOfferHistory().map((offer,index)=>{

const sender=offer.sender===selected.farmer?"You":"Mill";

return(
<div key={index}
className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-sm">
{sender}: Rs {offer.offeredPrice}
</div>
);

})}

</div>

</div>

)}

{/* Deal Summary */}

{selected.status==="AGREED" && (

<div className="p-4 border-b border-green-500/20 bg-green-500/10">

<h3 className="font-semibold text-green-500 mb-2">
Deal Confirmed
</h3>

<p className="text-sm">
Buyer: {selected.millOwner?.name}
</p>

<p className="text-sm">
Paddy: {selected.listing?.paddyType}
</p>

<p className="text-sm">
Quantity: {selected.listing?.quantityKg} kg
</p>

<p className="text-sm">
Final Price: Rs {getOfferHistory().slice(-1)[0]?.offeredPrice || "-"} /kg
</p>

</div>

)}

{/* Messages */}

<div className="flex-1 p-6 overflow-y-auto space-y-4">

{selected.messages.map((msg,index)=>{

const isMe=msg.sender===selected.farmer;

return(

<div key={index} className={`flex ${isMe?"justify-end":"justify-start"}`}>

<div className={`rounded-xl p-3 max-w-md shadow-sm
${isMe?"bg-[#22C55E]/20":"bg-muted"}
`}>

{msg.offeredPrice ? (

<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
<p className="text-sm font-semibold text-yellow-500">
Offer: Rs {msg.offeredPrice}/kg
</p>
</div>

):( <p className="text-sm">{msg.message}</p> )}

<p className="text-xs text-muted-foreground mt-1">
{new Date(msg.createdAt).toLocaleTimeString()}
</p>

</div>

</div>

);

})}

<div ref={bottomRef}></div>

</div>

{/* Message Input */}

<div className="p-4 border-t border-border">

<div className="flex gap-2">

<input
type="text"
placeholder="Type your message..."
value={message}
onChange={(e)=>setMessage(e.target.value)}
onKeyDown={(e)=>{if(e.key==="Enter") sendMessage()}}
className="flex-1 px-4 py-3 bg-[#161a20] border border-input rounded-lg"
/>

<button
onClick={sendMessage}
className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-black rounded-lg"
>
<Send className="w-5 h-5"/>
</button>

</div>

<div className="flex gap-2 mt-3">

<input
type="number"
placeholder="Counter price Rs/kg"
value={counterPrice}
onChange={(e)=>setCounterPrice(e.target.value)}
className="px-3 py-2 border rounded-lg bg-[#161a20]"
/>

<button
onClick={sendCounterOffer}
className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-sm"
>
Counter Offer
</button>

<button
onClick={()=>updateStatus("AGREED")}
className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-sm"
>
Accept
</button>

<button
onClick={()=>updateStatus("REJECTED")}
className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm"
>
Reject
</button>

</div>

</div>

</>

):( 

<div className="flex items-center justify-center h-full text-muted-foreground">
Select a conversation
</div>

)}

</div>

</div>

</div>

);

}