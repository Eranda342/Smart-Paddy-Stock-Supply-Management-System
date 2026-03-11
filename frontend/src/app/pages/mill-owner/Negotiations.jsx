import { Send } from 'lucide-react';

const negotiations = [
  { id: 1, farmer: 'John Doe', paddyType: 'Samba', quantity: '500 kg', lastMessage: 'I can do Rs 87/kg', time: '1 hour ago', unread: true },
  { id: 2, farmer: 'Kamal Silva', paddyType: 'Keeri Samba', quantity: '750 kg', lastMessage: 'Sounds good', time: '3 hours ago', unread: false },
];

export default function MillOwnerNegotiations() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Negotiations</h1>
        <p className="text-muted-foreground">Chat with farmers</p>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-280px)]">
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
                  <h3 className="font-medium">{neg.farmer}</h3>
                  {neg.unread && <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{neg.paddyType} - {neg.quantity}</p>
                <p className="text-sm text-muted-foreground truncate">{neg.lastMessage}</p>
                <p className="text-xs text-muted-foreground mt-1">{neg.time}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-card border border-border rounded-2xl flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">John Doe</h2>
            <p className="text-sm text-muted-foreground">Samba - 500 kg</p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-md">
                <p className="text-sm">I can do Rs 87/kg for this batch</p>
                <p className="text-xs text-muted-foreground mt-1">2:30 PM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-[#22C55E]/20 rounded-lg p-3 max-w-md">
                <p className="text-sm">Can you do Rs 90/kg? It's premium quality</p>
                <p className="text-xs text-muted-foreground mt-1">2:45 PM</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
