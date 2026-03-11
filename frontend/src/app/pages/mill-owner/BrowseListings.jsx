import { useState } from 'react';
import { MapPin, User, Package } from 'lucide-react';

const listings = [
  { id: 1, farmer: 'John Doe', location: 'Anuradhapura', paddyType: 'Samba', price: 'Rs 85/kg', quantity: '500 kg', verified: true },
  { id: 2, farmer: 'Kamal Silva', location: 'Polonnaruwa', paddyType: 'Keeri Samba', price: 'Rs 95/kg', quantity: '750 kg', verified: true },
  { id: 3, farmer: 'Nimal Fernando', location: 'Kurunegala', paddyType: 'Nadu', price: 'Rs 75/kg', quantity: '600 kg', verified: true },
  { id: 4, farmer: 'Sunil Perera', location: 'Anuradhapura', paddyType: 'Red Rice', price: 'Rs 120/kg', quantity: '450 kg', verified: true },
  { id: 5, farmer: 'Ravi Jayawardena', location: 'Ratnapura', paddyType: 'Samba', price: 'Rs 82/kg', quantity: '800 kg', verified: true },
  { id: 6, farmer: 'Lakmal Bandara', location: 'Polonnaruwa', paddyType: 'White Rice', price: 'Rs 88/kg', quantity: '550 kg', verified: true },
];

export default function BrowseListings() {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Browse Listings</h1>
        <p className="text-muted-foreground">Find paddy harvests from verified farmers</p>
      </div>

      <div className="flex gap-6">
        {/* Filter Panel */}
        <div className="w-[280px]">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-8">
            <h2 className="font-semibold mb-6">Filters</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                >
                  <option>All</option>
                  <option>Anuradhapura</option>
                  <option>Polonnaruwa</option>
                  <option>Kurunegala</option>
                  <option>Ratnapura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Paddy Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                >
                  <option>All</option>
                  <option>Samba</option>
                  <option>Keeri Samba</option>
                  <option>Nadu</option>
                  <option>Red Rice</option>
                  <option>White Rice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Quantity (kg)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Price Range (Rs/kg)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                  />
                </div>
              </div>

              <button className="w-full py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors">
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{listing.farmer}</h3>
                      {listing.verified && (
                        <span className="text-xs text-green-500">✓ Verified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>{listing.paddyType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="text-xl font-semibold text-[#22C55E]">{listing.price}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Available</div>
                    <div className="text-xl font-semibold">{listing.quantity}</div>
                  </div>
                </div>

                <button className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium">
                  Negotiate
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
