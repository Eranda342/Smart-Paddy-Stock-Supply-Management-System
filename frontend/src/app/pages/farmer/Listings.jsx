import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { PADDY_TYPES, DISTRICTS } from "../../../constants/paddyTypes";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput, FormSelect, FormTextarea } from "../../components/ui/form-fields";
import { Button } from "../../components/ui/button";
import { listingSchema } from "../../lib/schemas";

const socket = io("http://localhost:5000");

export default function FarmerListings() {

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [editListingId, setEditListingId] = useState(null);

  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(listingSchema),
    mode: "onChange",
    defaultValues: {
      paddyType: PADDY_TYPES[0],
      quantityKg: "",
      pricePerKg: "",
      district: DISTRICTS[0],
      address: "",
      description: "",
    },
  });


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

  const openCreateModal = () => {
    setEditListingId(null);
    reset({
      paddyType: PADDY_TYPES[0],
      quantityKg: "",
      pricePerKg: "",
      district: DISTRICTS[0],
      address: "",
      description: "",
    });
    setShowModal(true);
  };

  const openEditModal = (listing) => {
    setEditListingId(listing._id);
    reset({
      paddyType: listing.paddyType,
      quantityKg: String(listing.quantityKg),
      pricePerKg: String(listing.pricePerKg),
      district: listing.location?.district || DISTRICTS[0],
      address: listing.location?.address || "",
      description: listing.description || "",
    });
    setShowModal(true);
  };

  const handleSaveListing = async (data) => {
    try {
      const url = editListingId
        ? `http://localhost:5000/api/listings/${editListingId}`
        : "http://localhost:5000/api/listings";

      const method = editListingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingType: "SELL",
          paddyType: data.paddyType,
          quantityKg: Number(data.quantityKg),
          pricePerKg: Number(data.pricePerKg),
          district: data.district,
          address: data.address,
          description: data.description,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success(editListingId ? "Listing updated successfully" : "Listing created successfully", {
          style: { borderRadius: "8px", background: "#1f2937", color: "#fff" },
        });
        closeModal();
        setEditListingId(null);
        fetchListings();
      } else {
        toast.error(json.message || "Failed to save listing", {
          style: { borderRadius: "8px", background: "#1f2937", color: "#fff" },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error", { style: { borderRadius: "8px", background: "#1f2937", color: "#fff" } });
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">My Listings</h1>
          <p className="text-white/50 text-sm">Manage your paddy stock supply and inventory</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={openCreateModal}
          className="shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Listing
        </Button>
      </div>

      <div className="mb-8 flex relative z-10">
        <input
          type="text"
          placeholder="Search by paddy type or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-5 py-3.5 bg-white/[0.03] border border-white/10 text-white rounded-2xl focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder-white/30 backdrop-blur-md shadow-lg"
        />
      </div>

      <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.04]">
                <th className="px-6 py-5 text-xs font-semibold text-white/50 uppercase tracking-widest">Paddy Type</th>
                <th className="px-6 py-5 text-xs font-semibold text-white/50 uppercase tracking-widest">Quantity</th>
                <th className="px-6 py-5 text-xs font-semibold text-white/50 uppercase tracking-widest">Price</th>
                <th className="px-6 py-5 text-xs font-semibold text-white/50 uppercase tracking-widest">District</th>
                <th className="px-6 py-5 text-xs font-semibold text-white/50 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-semibold text-white/50 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-white/30">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-2 border border-white/5 pointer-events-none">
                        <Plus className="w-6 h-6 text-white/20" />
                      </div>
                      <p className="text-base font-medium">No listings found</p>
                      <p className="text-sm">Try adjusting your search or create a new listing.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr key={listing._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-medium text-white/95">{listing.paddyType}</td>
                    <td className="px-6 py-4 text-white/70">{listing.quantityKg.toLocaleString()} kg</td>
                    <td className="px-6 py-4 text-green-400 font-medium">Rs {listing.pricePerKg}/kg</td>
                    <td className="px-6 py-4 text-white/70">{listing.location?.district}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-green-500/10 text-green-400 border border-green-500/20">
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/farmer/listings/${listing._id}`)} title="View"
                          className="text-white/60 hover:text-white hover:bg-white/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(listing)} title="Edit"
                          className="text-white/60 hover:text-white hover:bg-white/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteListing(listing._id)} title="Delete"
                          className="text-white/60 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <style>{`
            @keyframes overlayFade {
              from { opacity: 0; backdrop-filter: blur(0px); }
              to { opacity: 1; backdrop-filter: blur(8px); }
            }
            @keyframes modalScale {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
          <div onClick={closeModal} className="fixed inset-0 bg-[#020617]/80 flex items-center justify-center z-50 p-4" style={{ animation: 'overlayFade 0.3s ease-out forwards' }}>
            <div onClick={(e) => e.stopPropagation()} className="bg-[#0A1120] border border-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-2xl relative shadow-2xl" style={{ animation: 'modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
              
              <Button type="button" variant="ghost" size="icon" onClick={closeModal} className="absolute top-6 right-6 text-white/40 hover:bg-white/5 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
              <h2 className="text-2xl font-bold tracking-tight mb-8 text-white">
                {editListingId ? "Edit Listing" : "Create New Listing"}
              </h2>

              <form onSubmit={handleSubmit(handleSaveListing)} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="e.g. 500"
                    error={errors.quantityKg?.message}
                    {...register("quantityKg")}
                  />
                  <FormInput
                    label="Price (Rs/kg)"
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
                </div>

                <FormInput
                  label="Address"
                  type="text"
                  placeholder="Street, village, or area"
                  error={errors.address?.message}
                  {...register("address")}
                />

                <FormTextarea
                  label="Description"
                  rows={4}
                  placeholder="Quality notes, harvest date, storage conditions…"
                  error={errors.description?.message}
                  {...register("description")}
                />

                <div className="flex gap-4 pt-4 mt-8 border-t border-white/10">
                  <Button type="button" variant="secondary" onClick={closeModal}
                    className="px-6 border-white/10 bg-white/5 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting || !isValid}>
                    {isSubmitting ? "Saving…" : editListingId ? "Update Listing" : "Create Listing"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}