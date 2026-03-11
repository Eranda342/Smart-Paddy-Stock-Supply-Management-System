import { Truck, MapPin, Clock } from 'lucide-react';

const activeTransports = [
  { id: 1, farmer: 'Kamal Silva', quantity: '750 kg', vehicle: 'LK-AB-1234', driver: 'Ravi Perera', pickup: 'Polonnaruwa', delivery: 'Colombo', eta: '3 hours' },
];

const transportHistory = [
  { id: 1, date: '2026-03-02', farmer: 'John Doe', quantity: '500 kg', status: 'Delivered', statusColor: 'text-green-500 bg-green-500/10' },
];

export default function MillOwnerTransport() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Transport</h1>
        <p className="text-muted-foreground">Track paddy deliveries</p>
      </div>

      <div className="space-y-8">
        {activeTransports.map((transport) => (
          <div key={transport.id} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Active Transport</h2>
                <p className="text-muted-foreground">From {transport.farmer}</p>
              </div>
              <span className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-sm font-medium">
                In Transit
              </span>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-[#22C55E]" />
                  <span className="text-sm font-medium">Vehicle</span>
                </div>
                <p className="font-semibold">{transport.vehicle}</p>
                <p className="text-sm text-muted-foreground">{transport.driver}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-[#22C55E]" />
                  <span className="text-sm font-medium">Route</span>
                </div>
                <p className="font-semibold">{transport.pickup} → {transport.delivery}</p>
                <p className="text-sm text-muted-foreground">{transport.quantity}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-[#22C55E]" />
                  <span className="text-sm font-medium">ETA</span>
                </div>
                <p className="font-semibold text-2xl">{transport.eta}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Transport History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-sm font-medium">Farmer</th>
                  <th className="text-left p-4 text-sm font-medium">Quantity</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transportHistory.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                    <td className="p-4">{item.date}</td>
                    <td className="p-4">{item.farmer}</td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
