const Vehicle = require("../models/Vehicle");

// ================= GET VEHICLES =================
exports.getVehicles = async (req, res) => {
  try {
    // Support both old (millOwner) and new (owner) documents
    const vehicles = await Vehicle.find({
      $or: [
        { owner: req.user.id },
        { millOwner: req.user.id }
      ]
    });

    res.status(200).json({
      success: true,
      vehicles
    });

  } catch (error) {
    console.error("GET VEHICLES ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vehicles"
    });
  }
};

// ================= ADD VEHICLE =================
exports.addVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      type,
      capacityKg,
      driverName,
      driverPhone
    } = req.body;

    const vehicle = await Vehicle.create({
      owner: req.user.id,
      vehicleNumber,
      type,
      capacityKg,
      driverName,
      driverPhone
    });

    res.status(201).json({
      success: true,
      vehicle
    });

  } catch (error) {
    console.error("ADD VEHICLE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add vehicle"
    });
  }
};

// ================= UPDATE VEHICLE =================
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      vehicle
    });

  } catch (error) {
    console.error("UPDATE VEHICLE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update vehicle"
    });
  }
};

// ================= DELETE VEHICLE =================
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully"
    });

  } catch (error) {
    console.error("DELETE VEHICLE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete vehicle"
    });
  }
};
