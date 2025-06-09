import express from "express";
import {
  createTimeSlot,
  getTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot,
  getTimeSlotsByDoctor,
  getAvailableTimeSlots,
} from "../controllers/timeSlot.controller.js";
import { authenticate, restrictTo } from "../middlewares/authmiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { timeSlotSchema } from "../validators/validator.js";

const router = express.Router();

// Create time slot (admin only)
router.post(
  "/",
  authenticate,
  restrictTo("admin"),
  validate(timeSlotSchema),
  createTimeSlot
);

// Get all time slots (admin only)
router.get("/", authenticate, restrictTo("admin"), getTimeSlots);

// Get time slots by doctor
router.get(
  "/doctor/me",
  authenticate,
  restrictTo("doctor"),
  getTimeSlotsByDoctor
);

router.get(
  "/doctor/:doctor_id",
  authenticate,
  restrictTo("admin"),
  getTimeSlotsByDoctor
);

// Get available time slots for a doctor on a specific date
router.get(
  "/available/me/:date",
  authenticate,
  restrictTo("doctor"),
  getAvailableTimeSlots
);

router.get(
  "/available/:doctor_id/:date",
  authenticate,
  restrictTo("admin", "patient"),
  getAvailableTimeSlots
);

// Get time slot by ID
router.get("/:id", authenticate, getTimeSlotById);

// Update time slot (admin only)
router.put(
  "/:id",
  authenticate,
  restrictTo("admin"),
  validate(timeSlotSchema.partial()),
  updateTimeSlot
);

// Delete time slot (admin only)
router.delete("/:id", authenticate, restrictTo("admin"), deleteTimeSlot);

export default router;
