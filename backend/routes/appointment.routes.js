import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";
import { authenticate, restrictTo } from "../middlewares/authmiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { appointmentSchema } from "../validators/validator.js";

const router = express.Router();

// Create appointment (admin or patient)
router.post(
  "/",
  authenticate,
  restrictTo("admin", "patient"),
  validate(appointmentSchema),
  createAppointment
);

// Get all appointments (admin only)
router.get("/", authenticate, restrictTo("admin"), getAppointments);

// Get appointments by doctor
router.get(
  "/doctor/me",
  authenticate,
  restrictTo("doctor"),
  getAppointmentsByDoctor
);

router.get(
  "/doctor/:doctor_id",
  authenticate,
  restrictTo("admin"),
  getAppointmentsByDoctor
);

// Get appointments by patient
router.get(
  "/patient/me",
  authenticate,
  restrictTo("patient"),
  getAppointmentsByPatient
);

router.get(
  "/patient/:patient_id",
  authenticate,
  restrictTo("admin"),
  getAppointmentsByPatient
);

// Get appointment by ID
router.get("/:id", authenticate, getAppointmentById);

// Update appointment
router.put(
  "/:id",
  authenticate,
  restrictTo("admin", "patient", "doctor"),
  validate(appointmentSchema.partial()),
  updateAppointment
);

// Delete appointment
router.delete(
  "/:id",
  authenticate,
  restrictTo("admin", "patient", "doctor"),
  deleteAppointment
);

// Update appointment status (doctor or admin)
router.patch(
  "/:id/status",
  authenticate,
  restrictTo("admin", "doctor"),
  validate(appointmentSchema.pick({ status: true })),
  updateAppointmentStatus
);

export default router;
