import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ListingDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const token = localStorage.getItem("token");

  const fetchListing = async () => {

    try {

      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setListing(data.listing);
      }

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    fetchListing();
  }, []);

  if (!listing) {
    return (
      <div className="max-w-[1000px] mx-auto p-10">
        <p className="text-gray-400">Loading listing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto p-10">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-700 rounded-lg"
      >
        ← Back
      </button>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">

        <h1 className="text-3xl font-semibold mb-6">
          Listing Details
        </h1>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-gray-400 text-sm">Paddy Type</p>
            <p className="text-lg font-medium">{listing.paddyType}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Quantity</p>
            <p className="text-lg font-medium">{listing.quantityKg} kg</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Price</p>
            <p className="text-lg font-medium">Rs {listing.pricePerKg}/kg</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">District</p>
            <p className="text-lg font-medium">{listing.location?.district}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Address</p>
            <p className="text-lg font-medium">{listing.location?.address}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-lg font-medium text-green-400">{listing.status}</p>
          </div>

        </div>

        <div className="mt-8">

          <p className="text-gray-400 text-sm mb-2">Description</p>

          <p className="text-lg">
            {listing.description || "No description provided"}
          </p>

        </div>

      </div>

    </div>
  );
}