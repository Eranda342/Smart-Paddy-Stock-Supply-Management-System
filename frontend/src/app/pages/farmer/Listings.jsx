import { useState } from 'react';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';

const mockListings = [
  { id: 1, paddyType: 'Samba', quantity: '500 kg', price: 'Rs 85/kg', district: 'Anuradhapura', status: 'Active', statusColor: 'text-green-500 bg-green-500/10' },
  { id: 2, paddyType: 'Keeri Samba', quantity: '750 kg', price: 'Rs 95/kg', district: 'Polonnaruwa', status: 'Active', statusColor: 'text-green-500 bg-green-500/10' },
  { id: 3, paddyType: 'Nadu', quantity: '600 kg', price: 'Rs 75/kg', district: 'Anuradhapura', status: 'Sold', statusColor: 'text-gray-500 bg-gray-500/10' },
  { id: 4, paddyType: 'Red Rice', quantity: '450 kg', price: 'Rs 120/kg', district: 'Kurunegala', status: 'Active', statusColor: 'text-green-500 bg-green-500/10' },
];

export default function FarmerListings() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your paddy listings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Listing
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Paddy Type</th>
                <th className="text-left p-4 text-sm font-medium">Quantity</th>
                <th className="text-left p-4 text-sm font-medium">Price</th>
                <th className="text-left p-4 text-sm font-medium">District</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockListings.map((listing) => (
                <tr key={listing.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                  <td className="p-4 font-medium">{listing.paddyType}</td>
                  <td className="p-4">{listing.quantity}</td>
                  <td className="p-4">{listing.price}</td>
                  <td className="p-4">{listing.district}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${listing.statusColor}`}>
                      {listing.status}
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

      {/* Create Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6">Create New Listing</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2">Paddy Type</label>
                  <select className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                    <option>Samba</option>
                    <option>Keeri Samba</option>
                    <option>Nadu</option>
                    <option>Red Rice</option>
                    <option>White Rice</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="e.g., 500"
                  />
                </div>
                <div>
                  <label className="block mb-2">Price (Rs/kg)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="e.g., 85"
                  />
                </div>
                <div>
                  <label className="block mb-2">District</label>
                  <select className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                    <option>Anuradhapura</option>
                    <option>Polonnaruwa</option>
                    <option>Kurunegala</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Add details about your paddy harvest..."
                />
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
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
