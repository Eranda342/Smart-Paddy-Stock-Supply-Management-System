import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerTransactions() {

  const [transactions, setTransactions] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchTransactions = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setTransactions(data.transactions || []);
      }

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getPaymentColor = (status) => {

    if (status === "PAID") {
      return "text-green-500 bg-green-500/10";
    }

    if (status === "PENDING") {
      return "text-yellow-500 bg-yellow-500/10";
    }

    return "text-gray-400 bg-gray-400/10";

  };

  const getTransportColor = (status) => {

    if (status === "COMPLETED") {
      return "text-green-500 bg-green-500/10";
    }

    if (status === "IN_TRANSPORT") {
      return "text-blue-500 bg-blue-500/10";
    }

    if (status === "DELIVERED") {
      return "text-purple-500 bg-purple-500/10";
    }

    if (status === "ORDER_CREATED") {
      return "text-yellow-500 bg-yellow-500/10";
    }

    return "text-gray-400 bg-gray-400/10";

  };

  const getBuyerName = (txn) => {

    if (txn?.millOwner?.fullName) {
      return txn.millOwner.fullName;
    }

    return "Mill Owner";

  };

  const formatMoney = (value) => {

    if (!value) return "-";

    return `Rs ${Number(value).toLocaleString()}`;

  };

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

                <th className="text-left p-4 text-sm font-medium">
                  Buyer
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Paddy Type
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Quantity
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Price / Kg
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Total
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Payment
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Transport
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {transactions.map((txn) => (

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

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getPaymentColor(txn?.paymentStatus)}`}
                    >

                      {txn?.paymentStatus || "PENDING"}

                    </span>

                  </td>

                  <td className="p-4">

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getTransportColor(txn?.status)}`}
                    >

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

              {transactions.length === 0 && (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-10 text-muted-foreground"
                  >

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