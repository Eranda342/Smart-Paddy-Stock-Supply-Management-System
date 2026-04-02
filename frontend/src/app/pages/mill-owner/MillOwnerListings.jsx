import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function MillOwnerListings() {

  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);

  const [paddyType, setPaddyType] = useState("Samba");
  const [quantityKg, setQuantityKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [district, setDistrict] = useState("Anuradhapura");

  const token = localStorage.getItem("token");

  const paddyTypes = [
    "Samba",
    "Keeri Samba",
    "Nadu",
    "Red Rice",
    "White Rice"
  ];

  const districts = [
    "Anuradhapura",
    "Polonnaruwa",
    "Kurunegala",
    "Ampara",
    "Hambantota"
  ];

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

    socket.on("dashboard_update", fetchListings);

    return () => {
      socket.off("dashboard_update", fetchListings);
    };
  }, []);

  const handleCreateListing = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingType: "BUY",
          paddyType,
          quantityKg,
          pricePerKg,
          district
        }),
      });

      if (res.ok) {

        alert("Buy request created");

        setShowModal(false);
        setQuantityKg("");
        setPricePerKg("");

        fetchListings();

      }

    } catch (error) {
      console.error(error);
    }

  };

  const handleDeleteListing = async (id) => {

    const confirmDelete = confirm("Delete this request?");
    if (!confirmDelete) return;

    try {

      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchListings();
      }

    } catch (error) {
      console.error(error);
    }

  };

  return (
    <div className="max-w-[1320px] mx-auto">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-semibold mb-2">Buy Requests</h1>
          <p className="text-muted-foreground">Create paddy purchase requests</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] text-black rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Create Request
        </button>

      </div>

      <table className="w-full">

        <thead>

          <tr className="border-b">
            <th className="text-left p-4">Paddy Type</th>
            <th className="text-left p-4">Quantity</th>
            <th className="text-left p-4">Price</th>
            <th className="text-left p-4">District</th>
            <th className="text-left p-4">Actions</th>
          </tr>

        </thead>

        <tbody>

          {listings.map((listing) => (

            <tr key={listing._id} className="border-b">

              <td className="p-4">{listing.paddyType}</td>

              <td className="p-4">{listing.quantityKg} kg</td>

              <td className="p-4">Rs {listing.pricePerKg}/kg</td>

              <td className="p-4">{listing.location?.district}</td>

              <td className="p-4">

                <button
                  onClick={() => handleDeleteListing(listing._id)}
                  className="text-red-500"
                >
                  <Trash2 />
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {showModal && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-gray-900 p-8 rounded-xl w-[500px]">

            <h2 className="text-xl mb-6">Create Buy Request</h2>

            <form onSubmit={handleCreateListing} className="space-y-4">

              <select
                value={paddyType}
                onChange={(e) => setPaddyType(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded"
              >
                {paddyTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Quantity (kg)"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded"
              />

              <input
                type="number"
                placeholder="Price per kg"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded"
              />

              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded"
              >
                {districts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <button className="w-full bg-[#22C55E] p-3 text-black rounded">
                Create Request
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}