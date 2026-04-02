import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { PADDY_TYPES, DISTRICTS } from "../../../constants/paddyTypes";
import toast from "react-hot-toast";

const socket = io("http://localhost:5000");

export default function FarmerListings() {

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [editListingId, setEditListingId] = useState(null);

  const [paddyType, setPaddyType] = useState("Samba");
  const [quantityKg, setQuantityKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [district, setDistrict] = useState("Anuradhapura");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");

  const resetForm = () => {
    setPaddyType("Samba");
    setQuantityKg("");
    setPricePerKg("");
    setDistrict("Anuradhapura");
    setAddress("");
    setDescription("");
  };

  const fetchListings = async () => {
    try {

      const res = await fetch("http://localhost:5000/api/listings/my", {
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
    document.title = "My Listings | AgroBridge";
    fetchListings();

    socket.on("dashboard_update", fetchListings);

    return () => {
      socket.off("dashboard_update", fetchListings);
    };
  }, []);

  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (showModal) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const openCreateModal = () => {
    setEditListingId(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (listing) => {

    setEditListingId(listing._id);

    setPaddyType(listing.paddyType);
    setQuantityKg(listing.quantityKg);
    setPricePerKg(listing.pricePerKg);
    setDistrict(listing.location?.district || "Anuradhapura");
    setAddress(listing.location?.address || "");
    setDescription(listing.description || "");

    setShowModal(true);
  };

  const handleSaveListing = async (e) => {
    e.preventDefault();

    try {

      const url = editListingId
        ? `http://localhost:5000/api/listings/${editListingId}`
        : "http://localhost:5000/api/listings";

      const method = editListingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingType: "SELL",
          paddyType,
          quantityKg,
          pricePerKg,
          district,
          address,
          description,
        }),
      });

      const data = await res.json();

      if (res.ok) {

        toast.success(editListingId ? "Listing updated successfully" : "Listing created successfully", {
          style: {
            borderRadius: "8px",
            background: "#1f2937",
            color: "#fff",
          },
        });

        closeModal();
        setEditListingId(null);

        resetForm();
        fetchListings();

      } else {
        toast.error(data.message || "Failed to create listing", {
          style: {
            borderRadius: "8px",
            background: "#1f2937",
            color: "#fff",
          },
        });
      }

    } catch (error) {
      console.error(error);
      toast.error("Server error", {
        style: { borderRadius: "8px", background: "#1f2937", color: "#fff" }
      });
    }
  };

  const handleDeleteListing = async (id) => {

    const confirmDelete = window.confirm("Delete this listing?");
    if (!confirmDelete) return;

    try {

      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Listing deleted", {
          style: { borderRadius: "8px", background: "#1f2937", color: "#fff" }
        });
        fetchListings();
      }

    } catch (error) {
      console.error(error);
    }
  };

  const filteredListings = listings.filter((listing) =>
    listing.paddyType.toLowerCase().includes(search.toLowerCase()) ||
    (listing.location?.district || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1320px] mx-auto">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-semibold mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your paddy listings</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-black rounded-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Listing
        </button>

      </div>

      <div className="mb-6">

        <input
          type="text"
          placeholder="Search by paddy type or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg"
        />

      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">

        <table className="w-full">

          <thead>

            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4">Paddy Type</th>
              <th className="text-left p-4">Quantity</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">District</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>

          </thead>

          <tbody>

            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  No listings found
                </td>
              </tr>
            ) : (
              filteredListings.map((listing) => (

                <tr key={listing._id} className="border-b border-border">

                  <td className="p-4 font-medium">{listing.paddyType}</td>
                  <td className="p-4">{listing.quantityKg} kg</td>
                  <td className="p-4">Rs {listing.pricePerKg}/kg</td>
                  <td className="p-4">{listing.location?.district}</td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-400">
                      {listing.status}
                    </span>
                  </td>

                  <td className="p-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() => navigate(`/farmer/listings/${listing._id}`)}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(listing)}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteListing(listing._id)}
                        className="p-2 hover:bg-muted rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

      {showModal && (
        <>
          <style>{`
            @keyframes overlayFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalScale {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
          <div 
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            style={{ animation: 'overlayFade 0.2s ease-out forwards' }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-[650px] relative shadow-2xl"
              style={{ animation: 'modalScale 0.2s ease-out forwards' }}
            >
              <button 
                type="button"
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all cursor-pointer z-50"
              >
                <X className="w-5 h-5" />
              </button>

            <h2 className="text-2xl font-semibold mb-6">
              {editListingId ? "Edit Listing" : "Create New Listing"}
            </h2>

            <form onSubmit={handleSaveListing} className="space-y-6">

              <div className="grid grid-cols-2 gap-6">

                <div>
                  <label className="block mb-2 text-sm font-medium">Paddy Type</label>
                  <select
                    value={paddyType}
                    onChange={(e) => setPaddyType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E]/50 transition-colors"
                  >
                    {PADDY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Quantity (kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E]/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Price (Rs/kg)</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E]/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E]/50 transition-colors"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                <label className="block mb-2">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg"
                />
              </div>

              <div className="flex gap-4">

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white transition-colors rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-black rounded-lg font-medium"
                >
                  {editListingId ? "Update Listing" : "Create Listing"}
                </button>

              </div>

            </form>

            </div>
          </div>
        </>
      )}

    </div>
  );
}