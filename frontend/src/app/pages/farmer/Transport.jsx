import { Truck, MapPin, Clock } from 'lucide-react';

const activeTransport = {
  id: 1,
  buyer: 'XYZ Mills Ltd',
  paddyType: 'Keeri Samba',
  quantity: '750 kg',
  vehicle: 'LK-AB-1234',
  driver: 'Kamal Perera',
  driverPhone: '+94 77 123 4567',
  status: 'In Transit',
  pickup: 'Anuradhapura',
  delivery: 'Polonnaruwa',
  eta: '2 hours',
};

const transportHistory = [
  { id: 1, date: '2026-03-02', buyer: 'ABC Rice Mill', quantity: '500 kg', status: 'Delivered', statusColor: 'text-green-500 bg-green-500/10' },
  { id: 2, date: '2026-02-28', buyer: 'Green Valley Mills', quantity: '600 kg', status: 'Delivered', statusColor: 'text-green-500 bg-green-500/10' },
  { id: 3, date: '2026-02-25', buyer: 'Lanka Rice Co', quantity: '450 kg', status: 'Delivered', statusColor: 'text-green-500 bg-green-500/10' },
];

export default function FarmerTransport() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Transport</h1>
        <p className="text-muted-foreground">Track your paddy deliveries</p>
      </div>

      {/* Active Transport */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Active Transport</h2>
            <p className="text-muted-foreground">{activeTransport.buyer}</p>
          </div>
          <span className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-sm font-medium">
            {activeTransport.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-[#22C55E]" />
              <span className="text-sm font-medium">Vehicle</span>
            </div>
            <p className="font-semibold">{activeTransport.vehicle}</p>
            <p className="text-sm text-muted-foreground">{activeTransport.driver}</p>
            <p className="text-sm text-muted-foreground">{activeTransport.driverPhone}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#22C55E]" />
              <span className="text-sm font-medium">Route</span>
            </div>
            <p className="font-semibold">{activeTransport.pickup} → {activeTransport.delivery}</p>
            <p className="text-sm text-muted-foreground">{activeTransport.paddyType}</p>
            <p className="text-sm text-muted-foreground">{activeTransport.quantity}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-[#22C55E]" />
              <span className="text-sm font-medium">ETA</span>
            </div>
            <p className="font-semibold text-2xl">{activeTransport.eta}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[#22C55E] rounded-full"></div>
          </div>
          <span className="text-sm text-muted-foreground">66% Complete</span>
        </div>
      </div>

      {/* Transport History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Transport History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Date</th>
                <th className="text-left p-4 text-sm font-medium">Buyer</th>
                <th className="text-left p-4 text-sm font-medium">Quantity</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {transportHistory.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                  <td className="p-4">{item.date}</td>
                  <td className="p-4">{item.buyer}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-[#22C55E] hover:underline text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
