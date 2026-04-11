import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function MillOwnerVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  // ================= FETCH =================
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ================= ADD =================
  const addVehicle = async (newVehicle) => {
    try {
      const res = await fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newVehicle)
      });
      if (res.ok) {
        fetchVehicles();
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE =================
  const deleteVehicle = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchVehicles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage your transport fleet</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" />
          Add Vehicle
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading vehicles...</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && vehicles.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No vehicles added yet. Click "Add Vehicle" to get started.
            </div>
          )}

          {/* Table */}
          {!loading && vehicles.length > 0 && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Vehicle Number</th>
                  <th className="text-left p-4 text-sm font-medium">Type</th>
                  <th className="text-left p-4 text-sm font-medium">Capacity</th>
                  <th className="text-left p-4 text-sm font-medium">Driver Name</th>
                  <th className="text-left p-4 text-sm font-medium">Driver Phone</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                    <td className="p-4 font-medium">{v.vehicleNumber}</td>
                    <td className="p-4">{v.type}</td>
                    <td className="p-4">{v.capacityKg} kg</td>
                    <td className="p-4">{v.driverName}</td>
                    <td className="p-4">{v.driverPhone}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        v.status === "ACTIVE"
                          ? "text-green-500 bg-green-500/10"
                          : "text-yellow-500 bg-yellow-500/10"
                      }`}>
                        {v.status === "ACTIVE" ? "Active" : "Maintenance"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon"
                          onClick={() => deleteVehicle(v._id)}
                          className="text-destructive hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <AddVehicleModal
          onClose={() => setShowModal(false)}
          onSubmit={addVehicle}
        />
      )}
    </div>
  );
}

// ================= MODAL =================
function AddVehicleModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    vehicleNumber: "",
    type: "Truck",
    capacityKg: "",
    driverName: "",
    driverPhone: ""
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, capacityKg: Number(form.capacityKg) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-xl w-full">
        <h2 className="text-2xl font-semibold mb-6">Add New Vehicle</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Vehicle Number</label>
              <input
                type="text"
                name="vehicleNumber"
                value={form.vehicleNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="e.g., LK-AB-1234"
              />
            </div>
            <div>
              <label className="block mb-2">Vehicle Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option>Truck</option>
                <option>Lorry</option>
                <option>Van</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Capacity (kg)</label>
              <input
                type="number"
                name="capacityKg"
                value={form.capacityKg}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="e.g., 2000"
              />
            </div>
            <div>
              <label className="block mb-2">Driver Name</label>
              <input
                type="text"
                name="driverName"
                value={form.driverName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="Driver's full name"
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-2">Driver Phone</label>
              <input
                type="tel"
                name="driverPhone"
                value={form.driverPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="+94 XX XXX XXXX"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="secondary" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Vehicle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
