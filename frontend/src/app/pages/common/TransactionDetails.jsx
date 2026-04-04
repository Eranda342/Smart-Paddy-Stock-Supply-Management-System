import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Truck, CreditCard, Package, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function TransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [vehicleType, setVehicleType] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const token = localStorage.getItem("token");

  // ✅ FIX: safer user decode
  let user = null;
  try {
    user = token ? JSON.parse(atob(token.split(".")[1])) : null;
  } catch {
    user = null;
  }

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

    const handleUpdate = () => {
      if (id) fetchTransaction();
    };

    socket.on("dashboard_update", handleUpdate);

    return () => {
      socket.off("dashboard_update", handleUpdate);
    };
  }, [id]);

  // Fetch mill owner's vehicles for the dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/vehicles", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setVehicles(data.vehicles || []);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
      }
    };
    fetchVehicles();
  }, []);

  const handleAction = async (endpoint) => {
    try {
      setActionLoading(true);

      const res = await fetch(`http://localhost:5000/api/transactions/${id}/${endpoint}`, {
        method: "PUT",
        headers: { 
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"
}
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error("Error: " + (data.message || "Failed to update status"));
      } else {
        fetchTransaction();
      }
    } catch (err) {
      toast.error("Network error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransportDecision = async (value) => {
    try {
      setActionLoading(true);

      const res = await fetch(`http://localhost:5000/api/transactions/${id}/transport-decision`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transportRequired: value })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error("Error: " + (data.message || "Failed to update transport decision"));
      } else {
        fetchTransaction();
      }
    } catch (err) {
      toast.error("Network error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFarmerDelivered = () => handleAction("farmer-delivered");
  const handleConfirmDelivery = () => handleAction("confirm-delivery");

  // ================= PICKUP (instant state update) =================
  const handlePickup = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:5000/api/transactions/${transaction?._id}/pickup`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error: " + (data.message || "Pickup failed"));
      } else {
        toast.success("Pickup confirmed 📦");
        setTransaction(data.transaction || data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Pickup failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ================= DELIVERED (instant state update) =================
  const handleDelivered = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:5000/api/transactions/${transaction?._id}/deliver`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error: " + (data.message || "Delivery update failed"));
      } else {
        toast.success("Delivery completed ✅");
        setTransaction(data.transaction || data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Delivery update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTransport = async () => {
    try {
      setActionLoading(true);

      const res = await fetch(`http://localhost:5000/api/transactions/${id}/assign-vehicle`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ vehicleId: selectedVehicle })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error("Error: " + (data.message || "Failed to assign transport"));
      } else {
        toast.success("Vehicle assigned 🚛");
        setSelectedVehicle("");
        setTransaction(data.transaction || data);
      }
    } catch (err) {
      toast.error("Network error occurred.");
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
      case "DELIVERY_IN_PROGRESS":
      case "TRANSPORT_SCHEDULED":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "ORDER_CREATED":
      case "PAYMENT_COMPLETED":
      case "PENDING":
      case "NOT_REQUIRED":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
    }
  };

  // ✅ FIX: proper buyer check
  const millOwnerId =
  typeof transaction?.millOwner === "object"
    ? transaction?.millOwner?._id
    : transaction?.millOwner;

  const farmerId =
  typeof transaction?.farmer === "object"
    ? transaction?.farmer?._id
    : transaction?.farmer;

  const isBuyer = user?.id === millOwnerId;
  const isFarmer = user?.id === farmerId;

  const renderActions = () => {
    const { status, paymentStatus, transportRequired } = transaction;

    // ================= COMPLETED =================
    if (status === "COMPLETED") {
      return (
        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-3 rounded-lg font-medium justify-center border border-green-500/20">
          <CheckCircle2 className="w-5 h-5" />
          Transaction Completed
        </div>
      );
    }

    // ================= PAYMENT =================
    if (paymentStatus === "PENDING") {
      if (isBuyer) {
        return (
          <button
            onClick={() => handleAction("pay")}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5" />
            {actionLoading ? "Processing..." : "Pay Now"}
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

    // ================= TRANSPORT DECISION (farmer chooses) =================
    if (paymentStatus === "PAID" && transportRequired === null) {
      if (isFarmer) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3">
              <button
                onClick={() => handleTransportDecision(true)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
              >
                <Truck className="w-5 h-5" />
                {actionLoading ? "Processing..." : "Yes, Need Transport"}
              </button>
              <button
                onClick={() => handleTransportDecision(false)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-border text-foreground px-4 py-3 rounded-lg font-semibold hover:bg-muted transition disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "No, I'll Deliver Myself"}
              </button>
            </div>
          </div>
        );
      } else if (isBuyer) {
        return (
          <div className="flex items-center justify-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-3 rounded-lg text-sm font-medium w-full">
            ⏳ Waiting for farmer decision
          </div>
        );
      }
    }

    // ================= TRANSPORT REQUIRED + PENDING =================
    // Mill owner assigns vehicle; farmer confirms driver collected paddy
    if (transaction?.transportRequired === true && transaction?.transportStatus === "PENDING") {
      if (isBuyer) {
        // Mill owner assigns a vehicle
        return (
          <div className="flex flex-col gap-3 w-full bg-card p-5 rounded-xl border border-border mt-4">
            <p className="text-sm font-semibold mb-1">Assign Transport Vehicle</p>

            {vehicles.length === 0 ? (
              <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                No vehicles found. Add vehicles in the{" "}
                <a href="/mill-owner/vehicles" className="text-[#22C55E] underline">Vehicles</a> section first.
              </p>
            ) : (
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                disabled={actionLoading}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              >
                <option value="">Select a vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} — {v.type} ({v.capacityKg} kg) · {v.driverName}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleAssignTransport}
              disabled={actionLoading || !selectedVehicle}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
            >
              <Truck className="w-5 h-5" />
              {actionLoading ? "Processing..." : "Assign Vehicle"}
            </button>
          </div>
        );
      } else if (isFarmer) {
        // Farmer confirms driver collected the paddy
        return (
          <div className="flex flex-col gap-3 w-full bg-card p-5 rounded-xl border border-border mt-4">
            <div className="mb-1">
              <p className="text-sm font-semibold">Awaiting Vehicle Assignment</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Once a vehicle is assigned, confirm when the driver collects your paddy.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-3 rounded-lg text-sm font-medium w-full">
              ⏳ Waiting for mill owner to assign a vehicle
            </div>
          </div>
        );
      }
    }

    // ================= TRANSPORT IN_PROGRESS — farmer confirms pickup =================
    // Farmer sees pickup button; mill owner waits
    if (
      transaction?.transportRequired === true &&
      transaction?.transportStatus === "IN_PROGRESS" &&
      !transaction?.pickupConfirmed
    ) {
      if (isFarmer) {
        return (
          <div className="flex flex-col gap-3 w-full bg-card p-5 rounded-xl border border-border mt-4">
            <div className="mb-1">
              <p className="text-sm font-semibold">Vehicle Assigned</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confirm once the driver has collected your paddy.
              </p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm mb-2 text-muted-foreground">
              <p><strong className="text-foreground">Vehicle:</strong>{" "}
                {transaction?.vehicle?.vehicleNumber || transaction?.vehicleDetails?.vehicleNumber || "N/A"}
                {" "}— {transaction?.vehicle?.type || transaction?.vehicleDetails?.vehicleType || ""}
              </p>
              {transaction?.vehicle?.driverName && (
                <p><strong className="text-foreground">Driver:</strong>{" "}
                  {transaction?.vehicle?.driverName} · {transaction?.vehicle?.driverPhone}
                </p>
              )}
            </div>
            <button
              onClick={handlePickup}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
            >
              <Truck className="w-5 h-5" />
              {actionLoading ? "Processing..." : "Confirm Driver Collected Paddy"}
            </button>
          </div>
        );
      } else if (isBuyer) {
        return (
          <div className="flex items-center justify-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-3 rounded-lg text-sm font-medium w-full">
            ⏳ Waiting for farmer to confirm pickup
          </div>
        );
      }
    }

    // ================= TRANSPORT IN_PROGRESS + PICKUP CONFIRMED — mill owner confirms receipt =================
    if (
      transaction?.transportRequired === true &&
      transaction?.transportStatus === "IN_PROGRESS" &&
      transaction?.pickupConfirmed === true
    ) {
      if (isBuyer) {
        return (
          <div className="flex flex-col gap-3 w-full bg-card p-5 rounded-xl border border-border mt-4">
            <div className="mb-1">
              <p className="text-sm font-semibold">Goods En Route</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confirm once the paddy has arrived at your mill.
              </p>
            </div>
            <button
              onClick={handleDelivered}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              {actionLoading ? "Processing..." : "Confirm Received at Mill"}
            </button>
          </div>
        );
      } else if (isFarmer) {
        return (
          <div className="flex items-center justify-center gap-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 px-4 py-3 rounded-lg text-sm font-medium w-full">
            🚚 Goods picked up — en route to mill
          </div>
        );
      }
    }

    // ================= SELF-DELIVERY (transportRequired === false) =================
    // Farmer confirms delivery; mill owner waits (no button)
    if (
      paymentStatus === "PAID" &&
      transportRequired === false &&
      transaction?.transportStatus !== "DELIVERED"
    ) {
      if (isFarmer) {
        return (
          <button
            onClick={handleFarmerDelivered}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
          >
            <Package className="w-5 h-5" />
            {actionLoading ? "Processing..." : "Confirm Delivery"}
          </button>
        );
      } else if (isBuyer) {
        return (
          <div className="flex items-center justify-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-3 rounded-lg text-sm font-medium w-full">
            ⏳ Waiting for farmer to confirm delivery
          </div>
        );
      }
    }

    // ================= SELF-DELIVERY DELIVERED — mill owner confirms receipt =================
    if (transaction?.transportStatus === "DELIVERED" && transportRequired === false && isBuyer) {
      return (
        <button
          onClick={handleConfirmDelivery}
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#22C55E]/90 transition disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5" />
          {actionLoading ? "Processing..." : "Confirm Received at Mill"}
        </button>
      );
    }

    return null;
  };

  // Stepper Logic
  const timeline = [
    {
      title: "Order Placed",
      desc: "Contract initialized",
      isDone: true,
      isActive: false
    },
    {
      title: "Payment",
      desc: transaction.paymentStatus === "PAID" ? "Payment secured" : "Awaiting buyer payment",
      isDone: transaction.paymentStatus === "PAID",
      isActive: transaction.paymentStatus === "PENDING"
    },
    {
      title: "Logistics",
      desc: transaction.transportRequired === false ? "Farmer self-delivery" : (transaction.transportRequired === true ? (transaction.transportStatus !== "PENDING" ? "Vehicle assigned & dispatched" : "Awaiting vehicle assignment") : "Pending logistics decision"),
      isDone: transaction.transportRequired === false || (transaction.transportRequired === true && transaction.transportStatus !== "PENDING"),
      isActive: transaction.paymentStatus === "PAID" && (transaction.transportRequired === null || (transaction.transportRequired && transaction.transportStatus === "PENDING"))
    },
    {
      title: "Delivery",
      desc: transaction.status === "COMPLETED" || transaction.status === "DELIVERED" ? "Successfully delivered" : "In transit / Pending",
      isDone: transaction.status === "COMPLETED" || transaction.status === "DELIVERED",
      isActive: (transaction.transportRequired === false || (transaction.transportRequired && transaction.transportStatus !== "PENDING")) && (transaction.status !== "COMPLETED" && transaction.status !== "DELIVERED")
    }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16 pt-8 px-4 sm:px-6 relative">
      
      {/* Decorative Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="self-start p-2.5 bg-white/[0.03] hover:bg-white/10 text-white/60 hover:text-white rounded-xl border border-white/10 transition-all backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Order {transaction.orderNumber}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md ${
              transaction.status === 'COMPLETED' || transaction.status === 'DELIVERED' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {transaction.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-white/50 text-sm font-medium tracking-wide">
            Detailed transaction context and live workflow coordination.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN - Order Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
            
            <h2 className="text-xl font-bold mb-6 text-white tracking-tight">Order Specifications</h2>
            
            <div className="grid grid-cols-2 gap-y-8 gap-x-6">
              <div className="group">
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-widest font-semibold group-hover:text-green-400 transition-colors">Buyer (Mill)</p>
                <p className="font-semibold text-white/90 text-sm sm:text-base">{getBuyerName(transaction)}</p>
              </div>
              <div className="group">
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-widest font-semibold group-hover:text-green-400 transition-colors">Farmer</p>
                <p className="font-semibold text-white/90 text-sm sm:text-base">{getFarmerName(transaction)}</p>
              </div>
              <div className="group">
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-widest font-semibold group-hover:text-green-400 transition-colors">Variety</p>
                <p className="font-semibold text-white/90 text-sm sm:text-base">{transaction?.listing?.paddyType || "-"}</p>
              </div>
              <div className="group">
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-widest font-semibold group-hover:text-green-400 transition-colors">Volume</p>
                <p className="font-semibold text-white/90 text-sm sm:text-base">{Number(transaction.quantityKg).toLocaleString()} kg</p>
              </div>
              <div className="group col-span-2">
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-widest font-semibold group-hover:text-green-400 transition-colors">Unit Price</p>
                <p className="font-semibold text-white/90 text-sm sm:text-base">{formatMoney(transaction.finalPricePerKg)} / kg</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center bg-white/[0.03] p-5 rounded-xl">
              <span className="text-white/60 font-semibold tracking-wide">Total Settlement</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {formatMoney(transaction.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Tracking Status & Actions */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold mb-8 text-white tracking-tight">Timeline & Progress</h2>
            
            {/* Vertical Stepper Timeline */}
            <div className="relative mb-10 pl-2">
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-white/10" />
              <div className="space-y-8 relative">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start relative">
                    <div className="mt-1 relative z-10 shrink-0">
                      {item.isDone ? (
                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                          <CheckCircle2 className="w-4 h-4 text-[#020617]" />
                        </div>
                      ) : item.isActive ? (
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/5 border-2 border-white/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold tracking-wide ${item.isDone ? 'text-white' : item.isActive ? 'text-blue-400' : 'text-white/40'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-xs mt-1 ${item.isDone ? 'text-green-400/80' : item.isActive ? 'text-white/70' : 'text-white/30'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BLOCK */}
            <div className="pt-6 border-t border-white/10">
              {renderActions()}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}