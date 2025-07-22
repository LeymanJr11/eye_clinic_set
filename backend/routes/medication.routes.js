import express from "express";
import {
  createMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
} from "../controllers/medication.controller.js";

const router = express.Router();

// POST /medications (admin only)
router.post("/", createMedication);
// GET /medications
router.get("/", getMedications);
// GET /medications/:id
router.get("/:id", getMedicationById);
// PUT /medications/:id (admin only)
router.put("/:id", updateMedication);
// DELETE /medications/:id (admin only)
router.delete("/:id", deleteMedication);

export default router;
