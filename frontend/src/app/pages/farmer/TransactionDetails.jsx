import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Truck, CreditCard, Package, ArrowLeft, Loader2 } from "lucide-react";

export default function TransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setTransaction(data.transaction || data);
      } else {
        setError(data.message || "Failed to load transaction details");
      }
    } catch (err) {
      setError("An error occurred while communicating with the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTransaction();
  }, [id]);

  const handleAction = async (endpoint) => {
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:5000/api/transactions/${id}/${endpoint}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert("Error: " + (data.message || "Failed to update status"));
      } else {
        // Refetch transaction after success
        fetchTransaction();
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-[#22C55E]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-[800px] mx-auto p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center">
        {error || "Transaction not found."}
      </div>
    );
  }

  const getBuyerName = (txn) => {
    return txn?.millOwner?.businessDetails?.businessName || txn?.millOwner?.fullName || "Rice Mill";
  };

  const getFarmerName = (txn) => {
    return txn?.farmer?.fullName || "Farmer";
  };

  const formatMoney = (val) => {
    return val ? `Rs ${Number(val).toLocaleString()}` : "-";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
      case "PAID":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "IN_PROGRESS":
      case "TRANSPORT_SCHEDULED":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "ORDER_CREATED":
      case "PENDING":
      case "NOT_REQUIRED":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
    }
  };

  const renderActions = () => {
    const { status, paymentStatus, transportStatus } = transaction;
    const isBuyer = user?.id === transaction?.millOwner?._id;

    if (status === "COMPLETED") {
      return (
        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-3 rounded-lg font-medium justify-center border border-green-500/20">
          <CheckCircle2 className="w-5 h-5" />
          Transaction Completed
        </div>
      );
    }

    if (paymentStatus === "PENDING") {
      if (isBuyer) {
        return (
          <button 
            onClick={() => handleAction("pay")}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5" />
            {actionLoading ? "Processing..." : "Mark as Paid"}
          </button>
        );
      } else {
        return (
          <div className="flex items-center justify-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-3 rounded-lg text-sm font-medium w-full">
            ⏳ Waiting for buyer to complete payment
          </div>
        );
      }
    }

    if (paymentStatus === "PAID" && transportStatus === "NOT_REQUIRED") {
      return (
        <button 
          onClick={() => handleAction("transport")}
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black px-4 py-3 rounded-lg font-semibold hover:bg-yellow-500/90 transition disabled:opacity-50"
        >
          <Truck className="w-5 h-5" />
          {actionLoading ? "Processing..." : "Request Transport"}
        </button>
      );
    }

    if (transportStatus === "PENDING") {
      return (
        <button 
          onClick={() => handleAction("start")}
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-500/90 transition disabled:opacity-50"
        >
          <Truck className="w-5 h-5" />
          {actionLoading ? "Processing..." : "Start Transport"}
        </button>
      );
    }

    if (transportStatus === "IN_PROGRESS") {
      return (
        <button 
          onClick={() => handleAction("deliver")}
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
        >
          <Package className="w-5 h-5" />
          {actionLoading ? "Processing..." : "Mark as Delivered"}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="max-w-[800px] mx-auto pb-10 pt-4">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-border bg-card"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Transaction: {transaction.orderNumber}
            </h1>
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(transaction.status)}`}>
              {transaction.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Review detailed context and execute order workflows below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* OVERVIEW INFO */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Order Details</h2>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Buyer (Mill)</p>
                <p className="font-medium text-[15px]">{getBuyerName(transaction)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Farmer</p>
                <p className="font-medium text-[15px]">{getFarmerName(transaction)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Paddy Type</p>
                <p className="font-medium text-[15px]">{transaction?.listing?.paddyType || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Quantity</p>
                <p className="font-medium text-[15px]">{transaction.quantityKg} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Price per kg</p>
                <p className="font-medium text-[15px]">{formatMoney(transaction.finalPricePerKg)}</p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-border flex justify-between items-center bg-[#161a20] p-5 rounded-xl border border-input">
              <span className="text-muted-foreground font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-[#22C55E]">{formatMoney(transaction.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* STATUS ACTIONS */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Tracking Status</h2>
            
            <div className="space-y-5 mb-8">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Payment</span>
                <span className={`self-start text-[11px] px-2.5 py-1 rounded-full font-bold ${getStatusColor(transaction.paymentStatus)}`}>
                  {transaction.paymentStatus}
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Transport</span>
                <span className={`self-start text-[11px] px-2.5 py-1 rounded-full font-bold ${getStatusColor(transaction.transportStatus)}`}>
                  {transaction.transportStatus.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* INTERACTIVE CONTROLS */}
            <div className="pt-5 border-t border-border">
              {renderActions()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}