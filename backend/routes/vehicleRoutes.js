const express = require("express");
const router = express.Router();

const { protect, checkApproved } = require("../middleware/authMiddleware");

const {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
} = require("../controllers/vehicleController");

// GET ALL
router.get("/", protect, checkApproved, getVehicles);

// ADD
router.post("/", protect, checkApproved, addVehicle);

// UPDATE
router.put("/:id", protect, checkApproved, updateVehicle);

// DELETE
router.delete("/:id", protect, checkApproved, deleteVehicle);

module.exports = router;
