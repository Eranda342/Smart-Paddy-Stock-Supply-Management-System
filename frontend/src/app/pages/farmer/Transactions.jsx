import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function FarmerTransactions() {

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchTransactions = async () => {

    try {

      setLoading(true);

      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch transactions:", data.message);
        setTransactions([]);
        return;
      }

      setTransactions(data.transactions || []);

    } catch (error) {
      console.error("Fetch error:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchTransactions();

    socket.on("dashboard_update", fetchTransactions);

    return () => {
      socket.off("dashboard_update", fetchTransactions);
    };
  }, []);

  // ================= UI HELPERS =================

  const getPaymentColor = (status) => {

    if (status === "PAID") return "text-green-500 bg-green-500/10";
    if (status === "PENDING") return "text-yellow-500 bg-yellow-500/10";

    return "text-gray-400 bg-gray-400/10";

  };

  const getStatusColor = (status) => {

    if (status === "CONFIRMED") return "text-green-500 bg-green-500/10";
    if (status === "ORDER_CREATED") return "text-yellow-500 bg-yellow-500/10";
    if (status === "DELIVERED") return "text-purple-500 bg-purple-500/10";

    return "text-gray-400 bg-gray-400/10";

  };

  // ✅ Buyer name fix
  const getBuyerName = (txn) => {

    if (txn?.millOwner?.businessDetails?.businessName) {
      return txn.millOwner.businessDetails.businessName;
    }

    if (txn?.millOwner?.fullName) {
      return txn.millOwner.fullName;
    }

    return "Mill Owner";

  };

  const formatMoney = (value) => {

    if (!value && value !== 0) return "-";

    return `Rs ${Number(value).toLocaleString()}`;

  };

  // ================= UI =================

  return (

    <div className="max-w-[1320px] mx-auto">

      <div className="mb-8">

        <h1 className="text-3xl font-semibold mb-2">
          Transactions
        </h1>

        <p className="text-muted-foreground">
          View your completed and ongoing transactions
        </p>

      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-border bg-muted/50">

                <th className="text-left p-4 text-sm font-medium">Buyer</th>
                <th className="text-left p-4 text-sm font-medium">Paddy Type</th>
                <th className="text-left p-4 text-sm font-medium">Quantity</th>
                <th className="text-left p-4 text-sm font-medium">Price / Kg</th>
                <th className="text-left p-4 text-sm font-medium">Total</th>
                <th className="text-left p-4 text-sm font-medium">Payment</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Action</th>

              </tr>

            </thead>

            <tbody>

              {/* 🔄 LOADING */}
              {loading && (

                <tr>
                  <td colSpan="8" className="text-center py-10 text-muted-foreground">
                    Loading transactions...
                  </td>
                </tr>

              )}

              {/* 📦 DATA */}
              {!loading && transactions.map((txn) => (

                <tr
                  key={txn._id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14"
                >

                  <td className="p-4 font-medium">
                    {getBuyerName(txn)}
                  </td>

                  <td className="p-4">
                    {txn?.listing?.paddyType || "-"}
                  </td>

                  <td className="p-4">
                    {txn?.quantityKg ? `${txn.quantityKg} kg` : "-"}
                  </td>

                  <td className="p-4">
                    {formatMoney(txn?.finalPricePerKg)}
                  </td>

                  <td className="p-4">
                    {formatMoney(txn?.totalAmount)}
                  </td>

                  <td className="p-4">

                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${getPaymentColor(txn?.paymentStatus)}`}>
                      {txn?.paymentStatus || "PENDING"}
                    </span>

                  </td>

                  <td className="p-4">

                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${getStatusColor(txn?.status)}`}>
                      {txn?.status || "ORDER_CREATED"}
                    </span>

                  </td>

                  <td className="p-4">

                    <button
                      onClick={() => navigate(`/farmer/transactions/${txn._id}`)}
                      className="text-[#22C55E] hover:underline text-sm"
                    >
                      View Details
                    </button>

                  </td>

                </tr>

              ))}

              {/* 📭 EMPTY */}
              {!loading && transactions.length === 0 && (

                <tr>
                  <td colSpan="8" className="text-center py-10 text-muted-foreground">
                    No transactions yet
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}