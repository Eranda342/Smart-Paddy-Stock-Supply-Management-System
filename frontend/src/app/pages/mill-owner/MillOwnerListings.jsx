import { useState, useEffect } from "react";
import { Plus, Trash2, X, Eye, Pencil, MapPin, Package, DollarSign, Tag, AlertTriangle } from "lucide-react";
import { io } from "socket.io-client";
import { PADDY_TYPES, DISTRICTS } from "../../../constants/paddyTypes";
import toast from "react-hot-toast";

const socket = io("http://localhost:5000");

export default function MillOwnerListings() {

  const [listings, setListings] = useState([]);

  // Create / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editListing, setEditListing] = useState(null); // null = create, object = edit

  // View modal
  const [viewListing, setViewListing] = useState(null);

  // Delete confirmation modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form fields
  const [paddyType, setPaddyType] = useState("Samba");
  const [quantityKg, setQuantityKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [district, setDistrict] = useState("Anuradhapura");

  const token = localStorage.getItem("token");

  // ── Fetch ──
  const fetchListings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/listings/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setListings(data.listings || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    document.title = "My Buy Requests | AgroBridge";
    fetchListings();
    socket.on("dashboard_update", fetchListings);
    return () => socket.off("dashboard_update", fetchListings);
  }, []);

  // ESC to close any open modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setViewListing(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Helpers ──
  const resetForm = () => {
    setPaddyType("Samba");
    setQuantityKg("");
    setPricePerKg("");
    setDistrict("Anuradhapura");
    setEditListing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (listing) => {
    setEditListing(listing);
    setPaddyType(listing.paddyType);
    setQuantityKg(listing.quantityKg);
    setPricePerKg(listing.pricePerKg);
    setDistrict(listing.location?.district || "Anuradhapura");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ── Create ──
  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingType: "BUY", paddyType, quantityKg, pricePerKg, district }),
      });
      if (res.ok) {
        toast.success("Buy request created");
        closeModal();
        fetchListings();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create request");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  // ── Edit / Update ──
  const handleUpdateListing = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${editListing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paddyType, quantityKg, pricePerKg, district }),
      });
      if (res.ok) {
        toast.success("Buy request updated");
        closeModal();
        fetchListings();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update request");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  // ── Delete ──
  const handleDeleteListing = async () => {
    if (!confirmDeleteId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Request deleted");
        setConfirmDeleteId(null);
        fetchListings();
      } else {
        toast.error("Failed to delete request");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  const isEditing = !!editListing;

  return (
    <div className="max-w-[1320px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Buy Requests</h1>
          <p className="text-muted-foreground">Create and manage your paddy purchase requests</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16a34a] text-black rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Request
        </button>
      </div>

      {/* ── Table ── */}
      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl text-muted-foreground">
          <Package className="w-8 h-8 mb-3 opacity-30" />
          <p className="font-medium">No buy requests yet</p>
          <p className="text-sm mt-1">Click "Create Request" to get started</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Paddy Type</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Quantity</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Price</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">District</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-4 font-medium">{listing.paddyType}</td>
                  <td className="px-5 py-4">{listing.quantityKg} kg</td>
                  <td className="px-5 py-4">Rs {listing.pricePerKg}/kg</td>
                  <td className="px-5 py-4">{listing.location?.district || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      listing.status === "ACTIVE"
                        ? "text-green-400 bg-green-400/10 border-green-400/20"
                        : listing.status === "COMPLETED"
                        ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
                        : "text-muted-foreground bg-muted/40 border-border"
                    }`}>
                      {listing.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* View */}
                      <button
                        onClick={() => setViewListing(listing)}
                        title="View details"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(listing)}
                        title="Edit request"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDeleteId(listing._id)}
                        title="Delete request"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <>
          <style>{`
            @keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes modalScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          `}</style>
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            style={{ animation: "overlayFade 0.2s ease-out forwards" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-card p-8 rounded-xl w-[500px] border border-border shadow-2xl relative"
              style={{ animation: "modalScale 0.2s ease-out forwards" }}
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold mb-1">
                {isEditing ? "Edit Buy Request" : "Create Buy Request"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {isEditing ? "Update the details of your request below." : "Fill in the details to post a new purchase request."}
              </p>

              <form onSubmit={isEditing ? handleUpdateListing : handleCreateListing} className="space-y-4">

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Paddy Type</label>
                  <select
                    value={paddyType}
                    onChange={(e) => setPaddyType(e.target.value)}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                  >
                    {PADDY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Quantity (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-colors"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Price per kg (Rs)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-colors"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-1/2 bg-muted hover:bg-muted/70 p-3 text-foreground rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[#22C55E] hover:bg-[#16a34a] p-3 text-black rounded-lg font-medium transition-colors"
                  >
                    {isEditing ? "Save Changes" : "Create Request"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </>
      )}

      {/* ── View Detail Modal ── */}
      {viewListing && (
        <>
          <style>{`
            @keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes modalScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          `}</style>
          <div
            onClick={() => setViewListing(null)}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            style={{ animation: "overlayFade 0.2s ease-out forwards" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-card p-8 rounded-xl w-[500px] border border-border shadow-2xl relative"
              style={{ animation: "modalScale 0.2s ease-out forwards" }}
            >
              <button
                onClick={() => setViewListing(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Request Details</h2>
                  <p className="text-xs text-muted-foreground font-mono">#{viewListing._id.substring(0, 10)}</p>
                </div>
              </div>

              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                      <Tag className="w-3.5 h-3.5" /> Paddy Type
                    </div>
                    <p className="font-semibold text-base">{viewListing.paddyType}</p>
                  </div>
                  <div className="bg-muted/40 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                      <Package className="w-3.5 h-3.5" /> Quantity
                    </div>
                    <p className="font-semibold text-base">{viewListing.quantityKg.toLocaleString()} kg</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                      <DollarSign className="w-3.5 h-3.5" /> Price per kg
                    </div>
                    <p className="font-semibold text-base text-[#22C55E]">Rs {viewListing.pricePerKg}</p>
                  </div>
                  <div className="bg-muted/40 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                      <MapPin className="w-3.5 h-3.5" /> District
                    </div>
                    <p className="font-semibold text-base">{viewListing.location?.district || "—"}</p>
                  </div>
                </div>

                <div className="bg-muted/40 border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Total Value</p>
                      <p className="font-bold text-xl text-[#22C55E]">
                        Rs {(viewListing.quantityKg * viewListing.pricePerKg).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        viewListing.status === "ACTIVE"
                          ? "text-green-400 bg-green-400/10 border-green-400/20"
                          : "text-muted-foreground bg-muted/40 border-border"
                      }`}>
                        {viewListing.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-1">
                  Posted on {new Date(viewListing.createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setViewListing(null); openEdit(viewListing); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted hover:bg-muted/70 p-3 rounded-lg font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" /> Edit Request
                </button>
                <button
                  onClick={() => setViewListing(null)}
                  className="flex-1 bg-[#22C55E] hover:bg-[#16a34a] p-3 text-black rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDeleteId && (
        <div
          onClick={() => setConfirmDeleteId(null)}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          style={{ animation: "overlayFade 0.15s ease-out forwards" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl shadow-2xl w-[420px] p-7 relative"
            style={{ animation: "modalScale 0.15s ease-out forwards" }}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>

            <h2 className="text-xl font-semibold text-center mb-2">Delete Request?</h2>
            <p className="text-sm text-muted-foreground text-center mb-7 leading-relaxed">
              This buy request will be permanently deleted and cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 bg-muted hover:bg-muted/70 text-foreground rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteListing}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}