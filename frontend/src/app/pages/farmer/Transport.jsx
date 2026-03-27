import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Loader2, CheckCircle2, Package, Phone, Check, Circle } from 'lucide-react';

const API = "http://localhost:5000/api";

export default function FarmerTransport() {
  const navigate = useNavigate();
  const [activeTransports, setActiveTransports] = useState([]);
  const [transportHistory, setTransportHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
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

    if (token) {
      fetchTransport();
      const interval = setInterval(fetchTransport, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setError("Please login to view transport data");
    }
  }, [token]);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  const formatTime = (iso) =>
    iso ? new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "";

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'DELIVERED': return 'bg-green-500/10 text-green-500 border border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
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
        <h1 className="text-3xl font-semibold mb-2">Transport Tracking</h1>
        <p className="text-muted-foreground">Monitor your paddy deliveries in real-time</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">
        {activeTransports.length === 0 && transportHistory.length > 0 ? "Last Completed Delivery" : "Ongoing Delivery"}
      </h2>
      
      {activeTransports.length === 0 && transportHistory.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 mb-8 text-center text-muted-foreground shadow-sm">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
          <p className="font-semibold text-lg">No deliveries yet 🚛</p>
          <p className="text-sm mt-1">When a vehicle is assigned to your order, it will appear here.</p>
        </div>
      ) : (
        (activeTransports.length > 0 ? activeTransports : [transportHistory[0]]).map((activeTransport) => {
          const isHistoryMode = activeTransports.length === 0;
          const status = isHistoryMode ? "DELIVERED" : (activeTransport?.transportStatus || "IN_PROGRESS");
          
          // Timeline logic strictly based on flags per user requirement
          const isVehicleAssigned = isHistoryMode ? true : !!(activeTransport?.vehicle || activeTransport?.vehicleDetails?.vehicleNumber);
          const isPickupConfirmed = isHistoryMode ? true : !!(activeTransport?.pickupConfirmed);
          const isDelivered = isHistoryMode ? true : status === "DELIVERED";

          return (
            <div key={activeTransport._id} className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">🚛</span> 
                    {isHistoryMode ? "TRANSPORT COMPLETED" : `TRANSPORT ${status.replace('_', ' ')}`}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    Order ID: #{activeTransport?._id?.substring(0, 8).toUpperCase() || "N/A"}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide inline-flex items-center gap-2 ${getStatusColor(status)}`}>
                  <div className={`w-2 h-2 rounded-full ${status === 'IN_PROGRESS' && !isDelivered ? 'animate-ping bg-blue-500' : 'bg-current'}`}></div>
                  {isHistoryMode ? "COMPLETED" : status.replace('_', ' ')}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted/50 rounded-full h-2.5 mt-6 mb-8 border border-border overflow-hidden">
                <div 
                  className="bg-[#22C55E] h-full transition-all duration-700 ease-in-out relative"
                  style={{ width: `${isDelivered ? 100 : isPickupConfirmed ? 66 : isVehicleAssigned ? 33 : 0}%` }}
                >
                  {!isHistoryMode && <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Delivery Info */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Vehicle Details</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vehicle Number</p>
                          <p className="font-semibold">{activeTransport?.vehicle?.vehicleNumber || activeTransport?.vehicleDetails?.vehicleNumber || "Not Assigned"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Driver Name</p>
                          <p className="font-semibold">{activeTransport?.vehicle?.driverName || "Not Assigned"}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Driver Phone</p>
                            <p className="font-semibold">{activeTransport?.vehicle?.driverPhone || "—"}</p>
                          </div>
                        </div>
                        {activeTransport?.vehicle?.driverPhone && (
                          <a 
                            href={`tel:${activeTransport.vehicle.driverPhone}`} 
                            className="px-4 py-1.5 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E] hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Call Driver 📞
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Quantity</p>
                      <p className="text-lg font-bold flex items-center gap-2">
                        <span className="text-xl">📦</span>
                        {activeTransport?.quantityKg ? `${activeTransport.quantityKg} kg` : "—"}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Route</p>
                      <p className="text-lg font-bold flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        To Mill
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6 bg-muted/30 rounded-xl border border-border flex flex-col justify-center">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Tracking Timeline</p>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    
                    {/* Step 1: Assigned */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow whitespace-nowrap ${(isVehicleAssigned) ? 'border-[#22C55E] text-[#22C55E]' : 'border-muted-foreground text-muted-foreground'}`}>
                        {(isVehicleAssigned) ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex flex-col mb-1">
                          <p className={`font-bold ${(isVehicleAssigned) ? 'text-foreground' : 'text-muted-foreground'}`}>Vehicle Assigned</p>
                          {isVehicleAssigned && <span className="text-xs text-muted-foreground mt-0.5 font-medium bg-muted/50 inline-block w-fit px-2 py-0.5 rounded-md border border-border/50">{formatTime(activeTransport.createdAt)}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Pickup */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow whitespace-nowrap ${(isPickupConfirmed) ? 'border-[#22C55E] text-[#22C55E]' : 'border-muted-foreground text-muted-foreground'}`}>
                        {(isPickupConfirmed) ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex flex-col mb-1">
                          <p className={`font-bold ${(isPickupConfirmed) ? 'text-foreground' : 'text-muted-foreground'}`}>Pickup Confirmed</p>
                          {isPickupConfirmed && activeTransport.pickupTime && <span className="text-xs text-muted-foreground mt-0.5 font-medium bg-muted/50 inline-block w-fit px-2 py-0.5 rounded-md border border-border/50">{formatTime(activeTransport.pickupTime)}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow whitespace-nowrap ${isDelivered ? 'border-[#22C55E] text-[#22C55E]' : 'border-muted-foreground text-muted-foreground'}`}>
                        {isDelivered ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex flex-col mb-1">
                          <p className={`font-bold ${isDelivered ? 'text-foreground' : 'text-muted-foreground'}`}>Delivered</p>
                          {isDelivered && activeTransport.deliveredTime && <span className="text-xs text-muted-foreground mt-0.5 font-medium bg-muted/50 inline-block w-fit px-2 py-0.5 rounded-md border border-border/50">{formatTime(activeTransport.deliveredTime)}</span>}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {isHistoryMode && (
                <div className="pt-4 mt-6 border-t border-border flex items-center justify-center gap-2 text-green-600 bg-green-500/10 p-3 rounded-lg font-semibold w-full">
                  <CheckCircle2 className="w-5 h-5" />
                  This delivery has been successfully completed
                </div>
              )}

              <div className={`flex justify-end pt-4 border-t border-border ${isHistoryMode ? 'mt-4' : ''}`}>
                <button
                  onClick={() => navigate(`/farmer/transactions/${activeTransport._id}`)}
                  className="w-full md:w-auto px-6 py-2.5 bg-[#22C55E] text-white rounded-lg hover:bg-[#16a34a] font-medium transition-colors shadow-sm shadow-[#22C55E]/20 flex items-center justify-center gap-2"
                >
                  View Transaction Details
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Transport History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mt-8">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <h2 className="text-xl font-semibold">Transport History</h2>
        </div>
        
        {transportHistory.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No completed deliveries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">To Mill</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {transportHistory.map((item) => (
                  <tr key={item._id} className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">
                    <td className="p-4 text-sm font-medium">{formatDate(item?.createdAt)}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{item?.millOwner?.name || item?.millOwner?.fullName || item?.millOwner?.businessDetails?.companyName || "Mill"}</td>
                    <td className="p-4 text-sm font-semibold">{item?.quantityKg ? `${item.quantityKg} kg` : "—"}</td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(item?.transportStatus || 'DELIVERED')}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {item?.transportStatus || "DELIVERED"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                         onClick={() => navigate(`/farmer/transactions/${item._id}`)}
                         className="text-[#22C55E] hover:text-[#16a34a] text-sm font-semibold transition-colors"
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
