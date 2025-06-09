import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import { doctorSchema } from "../validators/validator.js";
import { authenticate, restrictTo } from "../middlewares/authmiddleware.js";
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorDashboardStats,
  getDoctorAppointments,
  getDoctorPatients,
  getDoctorMedicalRecords,
} from "../controllers/doctor.controller.js";

const router = express.Router();

// All routes are protected with authentication and doctor role
router.use(authenticate);

// Create doctor
router.post(
  "/",
  restrictTo("admin", "patient"),
  validate(doctorSchema),
  createDoctor
);

// Get all doctors
router.get("/", getDoctors);

// Get doctor by ID
router.get("/:id", getDoctorById);

// Update doctor
router.put("/:id", validate(doctorSchema.partial()), updateDoctor);

// Delete doctor
router.delete("/:id", deleteDoctor);

// Get dashboard statistics
router.get("/dashboard/stats", getDoctorDashboardStats);

// Get doctor's appointments
router.get("/:id/appointments", getDoctorAppointments);

// Get doctor's patients
router.get("/:id/patients", getDoctorPatients);

// Get doctor's medical records
router.get("/:id/medical-records", getDoctorMedicalRecords);

export default router;
