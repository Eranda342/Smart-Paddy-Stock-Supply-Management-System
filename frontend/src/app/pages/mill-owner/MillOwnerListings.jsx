import { useState, useEffect } from "react";
import { Plus, Trash2, X, Eye, Pencil, MapPin, Package, DollarSign, Tag, AlertTriangle } from "lucide-react";
import { io } from "socket.io-client";
import { PADDY_TYPES, DISTRICTS } from "../../../constants/paddyTypes";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput, FormSelect } from "../../components/ui/form-fields";
import { Button } from "../../components/ui/button";
import { buyRequestSchema } from "../../lib/schemas";

const socket = io("http://localhost:5000");

export default function MillOwnerListings() {

  const [listings, setListings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [viewListing, setViewListing] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(buyRequestSchema),
    mode: "onChange",
    defaultValues: {
      paddyType: PADDY_TYPES[0],
      quantityKg: "",
      pricePerKg: "",
      district: DISTRICTS[0],
    },
  });

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

  const openCreate = () => {
    setEditListing(null);
    reset({ paddyType: PADDY_TYPES[0], quantityKg: "", pricePerKg: "", district: DISTRICTS[0] });
    setShowModal(true);
  };

  const openEdit = (listing) => {
    setEditListing(listing);
    reset({
      paddyType: listing.paddyType,
      quantityKg: String(listing.quantityKg),
      pricePerKg: String(listing.pricePerKg),
      district: listing.location?.district || DISTRICTS[0],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditListing(null);
  };

  // ── Create / Update (merged) ──
  const handleSaveListing = async (data) => {
    try {
      const url = editListing
        ? `http://localhost:5000/api/listings/${editListing._id}`
        : "http://localhost:5000/api/listings";
      const method = editListing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingType: "BUY",
          paddyType: data.paddyType,
          quantityKg: Number(data.quantityKg),
          pricePerKg: Number(data.pricePerKg),
          district: data.district,
        }),
      });

      if (res.ok) {
        toast.success(editListing ? "Buy request updated" : "Buy request created");
        closeModal();
        fetchListings();
      } else {
        const json = await res.json();
        toast.error(json.message || "Failed to save request");
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
        <Button variant="primary" size="lg" onClick={openCreate}>
          <Plus className="w-5 h-5" />
          Create Request
        </Button>
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
                  <td className="px-5 py-4">
                    {(() => {
                      const total = listing.quantityKg;
                      const available = listing.availableQuantityKg;
                      const fulfilled = total - available;
                      const percentage = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
                      return (
                        <div className="flex flex-col gap-1.5 w-48">
                          <div className="flex justify-between text-xs font-medium text-muted-foreground">
                            <span>{percentage}% completed</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {fulfilled.toLocaleString()}kg / {total.toLocaleString()}kg fulfilled
                            <span className="block opacity-75 mt-0.5">Remaining: {available.toLocaleString()}kg</span>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4">Rs {listing.pricePerKg}/kg</td>
                  <td className="px-5 py-4">{listing.location?.district || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      listing.status === "ACTIVE"
                        ? "text-green-500 bg-green-500/10 border-green-500/20"
                        : listing.status === "SOLD"
                        ? "text-blue-500 bg-blue-500/10 border-blue-500/20"
                        : listing.status === "FULFILLED"
                        ? "text-purple-500 bg-purple-500/10 border-purple-500/20"
                        : "text-muted-foreground bg-muted/40 border-border"
                    }`}>
                      {listing.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* View */}
                      <Button variant="ghost" size="icon"
                        onClick={() => setViewListing(listing)}
                        title="View details"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {/* Edit */}
                      <Button variant="ghost" size="icon"
                        onClick={() => openEdit(listing)}
                        title="Edit request"
                        className="text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {/* Delete */}
                      <Button variant="ghost" size="icon"
                        onClick={() => setConfirmDeleteId(listing._id)}
                        title="Delete request"
                        className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="absolute top-4 right-4 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-xl font-semibold mb-1">
                {isEditing ? "Edit Buy Request" : "Create Buy Request"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {isEditing ? "Update the details of your request below." : "Fill in the details to post a new purchase request."}
              </p>

              <form onSubmit={handleSubmit(handleSaveListing)} className="space-y-4" noValidate>

                <Controller
                  control={control}
                  name="paddyType"
                  render={({ field }) => (
                    <FormSelect
                      label="Paddy Type"
                      options={PADDY_TYPES}
                      error={errors.paddyType?.message}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />

                <FormInput
                  label="Quantity (kg)"
                  type="number"
                  placeholder="e.g. 5000"
                  error={errors.quantityKg?.message}
                  {...register("quantityKg")}
                />

                <FormInput
                  label="Price per kg (Rs)"
                  type="number"
                  placeholder="e.g. 120"
                  error={errors.pricePerKg?.message}
                  {...register("pricePerKg")}
                />

                <Controller
                  control={control}
                  name="district"
                  render={({ field }) => (
                    <FormSelect
                      label="District"
                      options={DISTRICTS}
                      error={errors.district?.message}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={closeModal} className="w-1/2">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="w-1/2" disabled={isSubmitting || !isValid}>
                    {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Create Request"}
                  </Button>
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
              <Button
                onClick={() => setViewListing(null)}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>

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
                      <Package className="w-3.5 h-3.5" /> Quantity Progress
                    </div>
                    {(() => {
                      const total = viewListing.quantityKg;
                      const available = viewListing.availableQuantityKg;
                      const fulfilled = total - available;
                      const percentage = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
                      return (
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <p className="font-semibold text-lg">{percentage}% completed</p>
                          </div>
                          <div className="h-2 w-full bg-muted overflow-hidden rounded-full mb-3">
                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="text-foreground font-medium">{fulfilled.toLocaleString()} kg</span>
                              <br />
                              <span className="text-xs">Fulfilled</span>
                            </div>
                            <div className="text-right">
                              <span className="text-foreground font-medium">{available.toLocaleString()} kg</span>
                              <br />
                              <span className="text-xs">Remaining</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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
                          ? "text-green-500 bg-green-500/10 border-green-500/20"
                          : viewListing.status === "SOLD"
                          ? "text-blue-500 bg-blue-500/10 border-blue-500/20"
                          : viewListing.status === "FULFILLED"
                          ? "text-purple-500 bg-purple-500/10 border-purple-500/20"
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
                <Button
                  variant="secondary"
                  onClick={() => { setViewListing(null); openEdit(viewListing); }}
                  className="flex-1"
                >
                  <Pencil className="w-4 h-4" /> Edit Request
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setViewListing(null)}
                  className="flex-1"
                >
                  Close
                </Button>
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
              <Button variant="secondary" onClick={() => setConfirmDeleteId(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteListing} className="flex-1">
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}