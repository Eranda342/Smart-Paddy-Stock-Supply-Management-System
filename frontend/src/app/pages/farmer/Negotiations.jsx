import { Send } from 'lucide-react';

const negotiations = [
  { id: 1, buyer: 'ABC Rice Mill', paddyType: 'Samba', quantity: '500 kg', lastMessage: 'Can you do Rs 90/kg?', time: '2 hours ago', unread: true },
  { id: 2, buyer: 'XYZ Mills Ltd', paddyType: 'Keeri Samba', quantity: '750 kg', lastMessage: 'Accepted your offer', time: '1 day ago', unread: false },
  { id: 3, buyer: 'Green Valley Mills', paddyType: 'Nadu', quantity: '600 kg', lastMessage: 'When can you deliver?', time: '2 days ago', unread: true },
];

export default function FarmerNegotiations() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Negotiations</h1>
        <p className="text-muted-foreground">Chat with rice mill owners</p>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        {/* Threads List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {negotiations.map((neg) => (
              <button
                key={neg.id}
                className="w-full p-4 border-b border-border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium">{neg.buyer}</h3>
                  {neg.unread && (
                    <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{neg.paddyType} - {neg.quantity}</p>
                <p className="text-sm text-muted-foreground truncate">{neg.lastMessage}</p>
                <p className="text-xs text-muted-foreground mt-1">{neg.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="col-span-2 bg-card border border-border rounded-2xl flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">ABC Rice Mill</h2>
            <p className="text-sm text-muted-foreground">Samba - 500 kg</p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-md">
                <p className="text-sm">I'm interested in your Samba harvest. Can you do Rs 90/kg?</p>
                <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-[#22C55E]/20 rounded-lg p-3 max-w-md">
                <p className="text-sm">My listed price is Rs 85/kg. Can we meet at Rs 87/kg?</p>
                <p className="text-xs text-muted-foreground mt-1">10:35 AM</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
              />
              <button className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors">
                Counter Offer
              </button>
              <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-sm transition-colors">
                Accept
              </button>
              <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm transition-colors">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
