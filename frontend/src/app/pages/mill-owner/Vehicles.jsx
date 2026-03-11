import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const vehicles = [
  { id: 1, number: 'LK-AB-1234', type: 'Truck', capacity: '2000 kg', driver: 'Ravi Perera', phone: '+94 77 123 4567', status: 'Active', statusColor: 'text-green-500 bg-green-500/10' },
  { id: 2, number: 'LK-CD-5678', type: 'Lorry', capacity: '3000 kg', driver: 'Saman Silva', phone: '+94 77 234 5678', status: 'Active', statusColor: 'text-green-500 bg-green-500/10' },
  { id: 3, number: 'LK-EF-9012', type: 'Truck', capacity: '1500 kg', driver: 'Nimal Fernando', phone: '+94 77 345 6789', status: 'Maintenance', statusColor: 'text-yellow-500 bg-yellow-500/10' },
];

export default function MillOwnerVehicles() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage your transport fleet</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Vehicle Number</th>
                <th className="text-left p-4 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-sm font-medium">Capacity</th>
                <th className="text-left p-4 text-sm font-medium">Driver Name</th>
                <th className="text-left p-4 text-sm font-medium">Driver Phone</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                  <td className="p-4 font-medium">{vehicle.number}</td>
                  <td className="p-4">{vehicle.type}</td>
                  <td className="p-4">{vehicle.capacity}</td>
                  <td className="p-4">{vehicle.driver}</td>
                  <td className="p-4">{vehicle.phone}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${vehicle.statusColor}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-xl w-full">
            <h2 className="text-2xl font-semibold mb-6">Add New Vehicle</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2">Vehicle Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="e.g., LK-AB-1234"
                  />
                </div>
                <div>
                  <label className="block mb-2">Vehicle Type</label>
                  <select className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                    <option>Truck</option>
                    <option>Lorry</option>
                    <option>Van</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Capacity (kg)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="e.g., 2000"
                  />
                </div>
                <div>
                  <label className="block mb-2">Driver Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="Driver's full name"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Driver Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="+94 XX XXX XXXX"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => { e.preventDefault(); setShowModal(false); }}
                  className="flex-1 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
