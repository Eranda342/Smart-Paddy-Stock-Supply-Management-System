import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function FarmerListings() {

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

  const paddyTypes = [
    "Samba","Keeri Samba","Nadu","Red Rice","White Rice","Kakulu",
    "Suwandel","Pachchaperumal","Madathawalu","Kuruluthuda",
    "Bg 352","Bg 358","Bg 360","At 362"
  ];

  const districts = [
    "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle",
    "Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle",
    "Kilinochchi","Kurunegala","Mannar","Matale","Matara","Monaragala",
    "Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura",
    "Trincomalee","Vavuniya"
  ];

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
    fetchListings();
  }, []);

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

        alert(editListingId ? "Listing updated successfully" : "Listing created successfully");

        setShowModal(false);
        setEditListingId(null);

        resetForm();
        fetchListings();

      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error(error);
      alert("Server error");
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
        alert("Listing deleted");
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

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-[650px]">

            <h2 className="text-2xl font-semibold mb-6">
              {editListingId ? "Edit Listing" : "Create New Listing"}
            </h2>

            <form onSubmit={handleSaveListing} className="space-y-6">

              <div className="grid grid-cols-2 gap-6">

                <div>

                  <label className="block mb-2">Paddy Type</label>

                  <select
                    value={paddyType}
                    onChange={(e) => setPaddyType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg"
                  >
                    {paddyTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>

                </div>

                <div>

                  <label className="block mb-2">Quantity (kg)</label>

                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg"
                  />

                </div>

                <div>

                  <label className="block mb-2">Price (Rs/kg)</label>

                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg"
                  />

                </div>

                <div>

                  <label className="block mb-2">District</label>

                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg"
                  >
                    {districts.map((d) => (
                      <option key={d}>{d}</option>
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
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-700 rounded-lg"
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

      )}

    </div>
  );
}