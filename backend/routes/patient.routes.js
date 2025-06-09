import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import { patientSchema } from "../validators/validator.js";
import { authenticate } from "../middlewares/authmiddleware.js";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientDashboardStats,
  getPatientAppointments,
  getPatientMedicalRecords,
  getPatientPayments,
  getPatientEyeTests,
} from "../controllers/patient.controller.js";

const router = express.Router();

// All routes are protected with authentication and a role
router.use(authenticate);

// Create patient
router.post("/", validate(patientSchema), createPatient);

// Get all patients
router.get("/", getPatients);

// Get patient by ID
router.get("/:id", getPatientById);

// Update patient
router.put("/:id", validate(patientSchema.partial()), updatePatient);

// Delete patient
router.delete("/:id", deletePatient);

// Get dashboard statistics
router.get("/dashboard/stats", getPatientDashboardStats);

// Get patient's appointments
router.get("/:id/appointments", getPatientAppointments);

// Get patient's medical records
router.get("/:id/medical-records", getPatientMedicalRecords);

// Get patient's payments
router.get("/:id/payments", getPatientPayments);

// Get patient's eye tests
router.get("/:id/eye-tests", getPatientEyeTests);

export default router;
