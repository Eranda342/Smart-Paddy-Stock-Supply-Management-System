const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
} = require("../controllers/vehicleController");

// GET ALL
router.get("/", protect, getVehicles);

// ADD
router.post("/", protect, addVehicle);

// UPDATE
router.put("/:id", protect, updateVehicle);

// DELETE
router.delete("/:id", protect, deleteVehicle);

module.exports = router;
