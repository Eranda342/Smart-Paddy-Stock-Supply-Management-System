import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, User, Package, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { Button } from "../../components/ui/button";

const socket = io("http://localhost:5000");

export default function BrowseListings() {

  const [listings, setListings] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortPrice, setSortPrice] = useState("none");
  const [negotiatingId, setNegotiatingId] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchListings = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/listings/marketplace", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setListings(data.listings);
      }

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    fetchListings();

    socket.on("dashboard_update", fetchListings);

    return () => {
      socket.off("dashboard_update", fetchListings);
    };
  }, []);

  const handleNegotiate = async (listing) => {
    setNegotiatingId(listing._id);
    try {
      const res = await fetch("http://localhost:5000/api/negotiations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing._id,
          message: "Hi, I am interested in your paddy listing.",
          offeredPrice: listing.pricePerKg,
          quantityKg: listing.quantityKg
        })
      });
      const data = await res.json();
      if (res.ok || res.status === 200) {
        const negId = data.negotiation?._id;
        toast.success(
          data.message === "Existing negotiation"
            ? "Reopening existing negotiation..."
            : "Negotiation started! Redirecting to chat..."
        );
        setTimeout(() => {
          navigate(`/mill-owner/negotiations/${negId}`);
        }, 800);
      } else {
        toast.error(data.message || "Failed to start negotiation");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setNegotiatingId(null);
    }
  };

  // Dynamic filter options

  const districts = [
    "All",
    ...new Set(listings.map((l) => l.location?.district).filter(Boolean))
  ];

  const paddyTypes = [
    "All",
    ...new Set(listings.map((l) => l.paddyType).filter(Boolean))
  ];

  // Filtering

  let filteredListings = listings.filter((listing) => {

    const districtMatch =
      selectedDistrict === "All" ||
      listing.location?.district === selectedDistrict;

    const typeMatch =
      selectedType === "All" ||
      listing.paddyType === selectedType;

    const quantityMatch =
      (!minQty || listing.quantityKg >= Number(minQty)) &&
      (!maxQty || listing.quantityKg <= Number(maxQty));

    const priceMatch =
      (!minPrice || listing.pricePerKg >= Number(minPrice)) &&
      (!maxPrice || listing.pricePerKg <= Number(maxPrice));

    return districtMatch && typeMatch && quantityMatch && priceMatch;

  });

  // Sorting

  if (sortPrice === "low") {
    filteredListings.sort((a, b) => a.pricePerKg - b.pricePerKg);
  }

  if (sortPrice === "high") {
    filteredListings.sort((a, b) => b.pricePerKg - a.pricePerKg);
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">
      <div className="mb-8 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Browse Listings</h1>
        <p className="text-white/50 text-sm">
          Discover and negotiate for verified paddy harvests directly from farmers.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        {/* FILTER PANEL */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl sticky top-8">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white/50 mb-6">Filters</h2>

            <div className="space-y-6">
              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A1120] border border-white/10 text-white rounded-xl focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all cursor-pointer"
                >
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Paddy Type */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Variety</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A1120] border border-white/10 text-white rounded-xl focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all cursor-pointer"
                >
                  {paddyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Volume (kg)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A1120] border border-white/10 text-white rounded-xl focus:outline-none focus:border-green-500/50 text-sm placeholder-white/20"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxQty}
                    onChange={(e) => setMaxQty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A1120] border border-white/10 text-white rounded-xl focus:outline-none focus:border-green-500/50 text-sm placeholder-white/20"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Price (Rs/kg)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A1120] border border-white/10 text-white rounded-xl focus:outline-none focus:border-green-500/50 text-sm placeholder-white/20"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A1120] border border-white/10 text-white rounded-xl focus:outline-none focus:border-green-500/50 text-sm placeholder-white/20"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Sort Order</label>
                <select
                  value={sortPrice}
                  onChange={(e) => setSortPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A1120] border border-white/10 text-white rounded-xl focus:outline-none focus:border-green-500/50 transition-all cursor-pointer text-sm"
                >
                  <option value="none">Recommended</option>
                  <option value="low">Lowest Price First</option>
                  <option value="high">Highest Price First</option>
                </select>
              </div>

              {/* Reset */}
              <Button variant="secondary"
                onClick={() => {
                  setSelectedDistrict("All");
                  setSelectedType("All");
                  setMinQty("");
                  setMaxQty("");
                  setMinPrice("");
                  setMaxPrice("");
                  setSortPrice("none");
                }}
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        </div>

        {/* LISTINGS GRID */}
        <div className="flex-1">
          {filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-white/30 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md">
              <Package className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium text-white/50">No listings found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredListings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(34,197,94,0.12)] transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center shadow-inner">
                      <User className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg tracking-tight">
                        {listing.owner?.fullName || "Farmer"}
                      </h3>
                      <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20 mt-1 inline-block">
                        ✓ Verified Farmer
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm text-white/70 bg-[#0A1120]/50 p-3 rounded-xl border border-white/5">
                      <MapPin className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="font-medium text-white/90">{listing.location?.district}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/70 bg-[#0A1120]/50 p-3 rounded-xl border border-white/5">
                      <Package className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="font-medium text-white/90">{listing.paddyType}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                    <div>
                      <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Rate</div>
                      <div className="text-xl font-bold text-green-400">Rs {listing.pricePerKg}/kg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Available</div>
                      <div className="text-xl font-bold text-white">{Number(listing.quantityKg).toLocaleString()} kg</div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => handleNegotiate(listing)}
                    disabled={negotiatingId === listing._id}
                    className="w-full py-3.5"
                  >
                    {negotiatingId === listing._id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      "Start Negotiation"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

}