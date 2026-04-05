import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, User, Package, RefreshCw } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function BrowseListings() {

  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sortPrice, setSortPrice] = useState("none");

  const token = localStorage.getItem("token");

  const fetchListings = useCallback(async (showRefreshAnimation = false) => {
    try {
      if (showRefreshAnimation) setIsRefreshing(true);

      const res = await fetch("http://localhost:5000/api/listings/buy-listings", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setListings(data.listings);
        setLastUpdated(new Date());
      }

    } catch (error) {
      console.error(error);
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  }, [token]);

  useEffect(() => {
    document.title = "Browse Listings | AgroBridge";
    fetchListings();

    socket.on("connect", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));
    socket.on("dashboard_update", () => fetchListings());
    socket.on("listing_created", () => fetchListings());
    socket.on("listing_deleted", () => fetchListings());

    if (socket.connected) setIsLive(true);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("dashboard_update");
      socket.off("listing_created");
      socket.off("listing_deleted");
    };
  }, [fetchListings]);

  const districts = [
    "All",
    ...new Set(listings.map((l) => l.location?.district).filter(Boolean))
  ];

  const paddyTypes = [
    "All",
    ...new Set(listings.map((l) => l.paddyType).filter(Boolean))
  ];

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

  if (sortPrice === "low") {
    filteredListings.sort((a, b) => a.pricePerKg - b.pricePerKg);
  }

  if (sortPrice === "high") {
    filteredListings.sort((a, b) => b.pricePerKg - a.pricePerKg);
  }

  const handleNegotiate = async (listing) => {

    try {

      const res = await fetch("http://localhost:5000/api/negotiations", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          listingId: listing._id,
          offeredPrice: listing.pricePerKg,
          quantityKg: listing.quantityKg,
          message: "I'm interested in your listing"
        })

      });

      const data = await res.json();

      if (res.ok) {

  navigate(`/farmer/negotiations/${data.negotiation._id}`);

} else {

        console.log(data.message);

      }

    } catch (error) {

      console.error(error);

    }

  };

  return (
    <div className="max-w-[1320px] mx-auto">

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold">Browse Listings</h1>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isLive
                ? "bg-green-500/15 text-green-400 border border-green-500/25"
                : "bg-gray-500/15 text-gray-400 border border-gray-500/25"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
              {isLive ? "Live" : "Offline"}
            </div>
          </div>
          <p className="text-muted-foreground">
            Find mill owners requesting paddy
            {lastUpdated && (
              <span className="ml-3 text-xs text-muted-foreground/60">
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => fetchListings(true)}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-6">

        <div className="w-[280px]">

          <div className="bg-card border border-border rounded-2xl p-6 sticky top-8">

            <h2 className="font-semibold mb-6">Filters</h2>

            <div className="space-y-6">

              <div>
                <label className="block text-sm font-medium mb-3">
                  District
                </label>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#161a20]"
                >
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>

                <label className="block text-sm font-medium mb-3">
                  Paddy Type
                </label>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#161a20]"
                >
                  {paddyTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>

              </div>

              <div>

                <label className="block text-sm font-medium mb-3">
                  Quantity (kg)
                </label>

                <div className="space-y-2">

                  <input
                    type="number"
                    placeholder="Min"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#161a20]"
                  />

                  <input
                    type="number"
                    placeholder="Max"
                    value={maxQty}
                    onChange={(e) => setMaxQty(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#161a20]"
                  />

                </div>

              </div>

              <div>

                <label className="block text-sm font-medium mb-3">
                  Price Range (Rs/kg)
                </label>

                <div className="space-y-2">

                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#161a20]"
                  />

                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#161a20]"
                  />

                </div>

              </div>

              <div>

                <label className="block text-sm font-medium mb-3">
                  Sort By Price
                </label>

                <select
                  value={sortPrice}
                  onChange={(e) => setSortPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#161a20]"
                >
                  <option value="none">Default</option>
                  <option value="low">Low → High</option>
                  <option value="high">High → Low</option>
                </select>

              </div>

              <button
                onClick={() => {
                  setSelectedDistrict("All");
                  setSelectedType("All");
                  setMinQty("");
                  setMaxQty("");
                  setMinPrice("");
                  setMaxPrice("");
                  setSortPrice("none");
                }}
                className="w-full py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm"
              >
                Reset Filters
              </button>

            </div>

          </div>

        </div>

        <div className="flex-1">

          {filteredListings.length === 0 ? (

            <div className="text-center text-muted-foreground mt-20">
              No listings match your filters
            </div>

          ) : (

            <div className="grid grid-cols-2 gap-6">

              {filteredListings.map((listing) => (

                <div
                  key={listing._id}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all"
                >

                  <div className="flex items-center gap-3 mb-4">

                    <div className="w-10 h-10 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#22C55E]" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {listing.owner?.businessDetails?.businessName || listing.owner?.fullName || "Mill Owner"}
                      </h3>
                      <span className="text-xs text-green-500">
                        ✓ Verified Buyer
                      </span>
                    </div>

                  </div>

                  <div className="space-y-3 mb-6">

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location?.district}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>{listing.paddyType}</span>
                    </div>

                  </div>

                  <div className="flex items-center justify-between mb-3">

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Offered Price
                      </div>
                      <div className="text-xl font-semibold text-[#22C55E]">
                        Rs {listing.pricePerKg}/kg
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Requested
                      </div>
                      <div className="text-xl font-semibold">
                        {listing.quantityKg.toLocaleString()} kg
                      </div>
                    </div>

                  </div>

                  {(() => {
                    const total = listing.quantityKg;
                    const available = listing.availableQuantityKg;
                    const fulfilled = total - available;
                    const percentage = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
                    return (
                      <div className="mb-6 pb-6 border-b border-border">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-[#22C55E]">{percentage > 0 ? `${percentage}% already fulfilled!` : 'Be the first to fulfill!'}</span>
                          <span className="text-foreground">Only {available.toLocaleString()}kg remaining</span>
                        </div>
                        <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                          <div className="h-full bg-[#22C55E] rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={() => handleNegotiate(listing)}
                    className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-black rounded-lg font-medium"
                  >
                    Negotiate
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}