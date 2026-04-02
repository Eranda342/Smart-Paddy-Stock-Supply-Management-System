import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, User, Package, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

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
    <div className="max-w-[1320px] mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Browse Listings</h1>
        <p className="text-muted-foreground">
          Find paddy harvests from verified farmers
        </p>
      </div>

      <div className="flex gap-6">

        {/* FILTER PANEL */}

        <div className="w-[280px]">

          <div className="bg-card border border-border rounded-2xl p-6 sticky top-8">

            <h2 className="font-semibold mb-6">Filters</h2>

            <div className="space-y-6">

              {/* District */}

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

              {/* Paddy Type */}

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

              {/* Quantity */}

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

              {/* Price */}

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

              {/* Sort */}

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

              {/* Reset */}

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

        {/* LISTINGS GRID */}

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
                        {listing.owner?.fullName || "Farmer"}
                      </h3>
                      <span className="text-xs text-green-500">
                        ✓ Verified Farmer
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

                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Price
                      </div>
                      <div className="text-xl font-semibold text-[#22C55E]">
                        Rs {listing.pricePerKg}/kg
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">
                        Available
                      </div>
                      <div className="text-xl font-semibold">
                        {listing.quantityKg} kg
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={() => handleNegotiate(listing)}
                    disabled={negotiatingId === listing._id}
                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                      negotiatingId === listing._id
                        ? "bg-[#22C55E]/50 text-black/60 cursor-not-allowed"
                        : "bg-[#22C55E] hover:bg-[#16A34A] text-black hover:scale-[1.02] active:scale-95"
                    }`}
                  >
                    {negotiatingId === listing._id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      "Negotiate"
                    )}
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