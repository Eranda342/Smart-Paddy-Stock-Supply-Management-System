import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { FormInput, FormSelect } from '../../components/ui/form-fields';
import { vehicleSchema } from '../../lib/schemas';

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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    mode: "onChange",
    defaultValues: {
      vehicleNumber: "",
      type: "Truck",
      capacityKg: "",
      driverName: "",
      driverPhone: "",
    },
  });

  const onValid = (data) => {
    onSubmit({ ...data, capacityKg: Number(data.capacityKg) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-xl w-full">
        <h2 className="text-2xl font-semibold mb-6">Add New Vehicle</h2>
        <form className="space-y-4" onSubmit={handleSubmit(onValid)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Vehicle Number"
              placeholder="e.g., LK-AB-1234"
              error={errors.vehicleNumber?.message}
              {...register("vehicleNumber")}
            />
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <FormSelect
                  label="Vehicle Type"
                  options={["Truck", "Lorry", "Van"]}
                  error={errors.type?.message}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
            <FormInput
              label="Capacity (kg)"
              type="number"
              placeholder="e.g., 2000"
              error={errors.capacityKg?.message}
              {...register("capacityKg")}
            />
            <FormInput
              label="Driver Name"
              placeholder="Driver's full name"
              error={errors.driverName?.message}
              {...register("driverName")}
            />
            <div className="col-span-2">
              <FormInput
                label="Driver Phone"
                type="tel"
                placeholder="+94 XX XXX XXXX"
                error={errors.driverPhone?.message}
                {...register("driverPhone")}
              />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Saving…" : "Save Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
