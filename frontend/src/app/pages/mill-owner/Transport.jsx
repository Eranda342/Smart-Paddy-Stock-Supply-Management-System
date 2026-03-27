import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Package, Loader2, CheckCircle2, MapPin, Route, Phone, Clock, Circle } from "lucide-react";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api";

export default function MillOwnerTransport() {
  const navigate = useNavigate();
  const [activeTransports, setActiveTransports] = useState([]);
  const [transportHistory, setTransportHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchTransport = async () => {
    try {
      const res = await fetch(`${API}/transports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveTransports(data.active || []);
        setTransportHistory(data.history || []);
      } else {
        setError(data.message || "Failed to load transport data");
      }
    } catch (err) {
      setError("Network error — could not load transport data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransport();
      const interval = setInterval(fetchTransport, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setError("Please login to view transport data");
    }
  }, [token]);

  const handleConfirmDelivery = async (id) => {
    try {
      const res = await fetch(`${API}/transactions/${id}/deliver`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Delivery completed ✅");
        fetchTransport();
      } else {
        toast.error("Something went wrong ❌");
        console.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Something went wrong ❌");
      console.error("Error confirming delivery", err);
    }
  };

  const getFarmerName = (txn) => txn?.farmer?.name || txn?.farmer?.fullName || "Farmer";
  const getMillName = (txn) => txn?.millOwner?.name || txn?.millOwner?.fullName || txn?.millOwner?.businessDetails?.companyName || "Mill Owner";

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'DELIVERED': return 'bg-green-500/10 text-green-500 border border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  const getStatusText = (txn) => {
    if (txn?.transportStatus === "DELIVERED") return "Delivered";
    if (txn?.pickupConfirmed === true) return "In Transit to Mill";
    if (txn?.vehicle || txn?.vehicleDetails?.vehicleNumber) return "Waiting for pickup confirmation";
    return "Waiting for vehicle assignment";
  };

  if (loading && activeTransports.length === 0 && transportHistory.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-[#22C55E]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[900px] mx-auto p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Transport Control Panel</h1>
        <p className="text-muted-foreground">Manage and track your active inbound paddy deliveries</p>
      </div>

      {/* ===== ACTIVE TRANSPORT ===== */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">
          {activeTransports.length === 0 && transportHistory.length > 0 ? "Last Completed Delivery" : "Ongoing Delivery"}
        </h2>

        {activeTransports.length === 0 && transportHistory.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground shadow-sm">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No deliveries yet 🚛</p>
            <p className="text-sm mt-1">Incoming transport orders will appear here once active.</p>
          </div>
        ) : (
          (activeTransports.length > 0 ? activeTransports : [transportHistory[0]]).map((activeTransport) => {
            const isHistoryMode = activeTransports.length === 0;
            const statusLabel = isHistoryMode ? "Delivered" : getStatusText(activeTransport);
            const statusEnum = isHistoryMode ? "DELIVERED" : (activeTransport?.transportStatus || "IN_PROGRESS");
            const isAssigned = isHistoryMode ? true : !!(activeTransport?.vehicle || activeTransport?.vehicleDetails?.vehicleNumber);
            const inTransit = isHistoryMode ? false : activeTransport?.pickupConfirmed === true && statusEnum !== "DELIVERED";

            return (
              <div key={activeTransport._id} className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
                {/* Header block with visual color status */}
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                   <h3 className="text-xl font-bold flex items-center gap-2">
                     <span className="text-2xl">🚛</span> 
                     {isHistoryMode ? "TRANSPORT COMPLETED" : statusLabel}
                   </h3>
                   <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide inline-flex items-center gap-2 ${getStatusColor(statusEnum)}`}>
                     <div className={`w-2 h-2 rounded-full ${inTransit ? 'animate-ping bg-blue-500' : 'bg-current'}`}></div>
                     {isHistoryMode ? "COMPLETED" : statusEnum.replace('_', ' ')}
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LEFT: Vehicle + Driver */}
                  <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logistics Team</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vehicle Number</p>
                          <p className="font-semibold">{activeTransport?.vehicle?.vehicleNumber || activeTransport?.vehicleDetails?.vehicleNumber || "Waiting Assignment"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Driver Name</p>
                          <p className="font-semibold">{activeTransport?.vehicle?.driverName || "Not Assigned"}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Driver Phone</p>
                            <p className="font-semibold">{activeTransport?.vehicle?.driverPhone || "—"}</p>
                          </div>
                        </div>
                        {activeTransport?.vehicle?.driverPhone && (
                          <a 
                            href={`tel:${activeTransport.vehicle.driverPhone}`} 
                            className="px-3 py-1.5 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E] hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Call Driver 📞
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE: Quantity + Route */}
                  <div className="p-5 bg-muted/30 border border-border rounded-xl flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Order Cargo</p>
                      <div className="flex items-center justify-between bg-background p-4 rounded-lg border border-border">
                        <p className="font-semibold text-muted-foreground">Quantity <span className="text-xl ml-1">📦</span></p>
                        <p className="text-xl font-bold">{activeTransport?.quantityKg ? `${activeTransport.quantityKg} kg` : "—"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Target Route</p>
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col items-center gap-1">
                             <Circle className="w-3 h-3 text-orange-500 fill-current" />
                             <div className="w-px h-6 bg-border"></div>
                             <MapPin className="w-4 h-4 text-[#22C55E] fill-[#22C55E]/20" />
                           </div>
                           <div className="space-y-4 w-full">
                             <div className="flex justify-between items-center">
                               <p className="text-sm font-semibold">{getFarmerName(activeTransport)}</p>
                               <span className="text-xs text-muted-foreground font-medium">Origin</span>
                             </div>
                             <div className="flex justify-between items-center">
                               <p className="text-sm font-semibold">{getMillName(activeTransport)}</p>
                               <span className="text-xs text-muted-foreground font-medium">Destination</span>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Status + Action Button */}
                  <div className="p-5 border-2 border-primary/10 bg-primary/5 rounded-xl flex flex-col justify-between">
                     <div>
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Milestone Actions</p>
                       
                       <div className="space-y-4 mb-6">
                         {isHistoryMode ? (
                           <div className="flex items-center justify-center p-3 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20 shadow-sm gap-2">
                             <CheckCircle2 className="w-5 h-5" />
                             <p className="text-sm font-bold">This delivery has been successfully completed</p>
                           </div>
                         ) : (
                           <>
                             <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border shadow-sm">
                               <p className="text-sm font-semibold">Farmer Pickup Confirmation</p>
                               {activeTransport?.pickupConfirmed ? (
                                 <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded">Confirmed ✓</span>
                               ) : (
                                 <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">Awaiting...</span>
                               )}
                             </div>

                             {inTransit && (
                               <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                 <Clock className="w-4 h-4 animate-pulse" />
                                 <span>Estimated arrival: 2-3 hours</span>
                               </div>
                             )}
                           </>
                         )}
                       </div>
                     </div>

                     <div className="space-y-3">
                       {activeTransport?.pickupConfirmed === true && statusEnum !== "DELIVERED" && (
                         <button
                           onClick={() => handleConfirmDelivery(activeTransport._id)}
                           className="w-full py-3 bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm rounded-lg font-bold transition-all shadow-md active:scale-[0.98] animate-[pop_0.3s_ease-out]"
                         >
                           Confirm Arrival at Mill
                         </button>
                       )}
                       
                       <button
                         onClick={() => navigate(`/mill-owner/transactions/${activeTransport._id}`)}
                         className="w-full py-2.5 bg-background hover:bg-muted text-foreground border border-border text-sm rounded-lg font-medium transition-colors"
                       >
                         View Transaction Details →
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== HISTORY ===== */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <h2 className="text-xl font-semibold">Transport History</h2>
        </div>

        {transportHistory.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No completed deliveries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Farmer</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {transportHistory.map((item) => (
                  <tr key={item._id} className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">
                    <td className="p-4 text-sm font-medium">{formatDate(item?.createdAt)}</td>
                    <td className="p-4 text-sm font-semibold">{getFarmerName(item)}</td>
                    <td className="p-4 text-sm">{item?.vehicle?.vehicleNumber || item?.vehicleDetails?.vehicleNumber || "—"}</td>
                    <td className="p-4 text-sm font-semibold">{item?.quantityKg ? `${item.quantityKg} kg` : "—"}</td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(item?.transportStatus || "DELIVERED")}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {item?.transportStatus || "DELIVERED"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/mill-owner/transactions/${item._id}`)}
                        className="text-[#22C55E] hover:text-[#16a34a] text-sm font-bold transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
