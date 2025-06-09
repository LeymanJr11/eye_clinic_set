import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import { medicalRecordSchema } from "../validators/validator.js";
import { authenticate, restrictTo } from "../middlewares/authmiddleware.js";
import multer from "multer";
import path from "path";
import {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsByPatient,
  getMedicalRecordsByDoctor,
  getMedicalRecordsByAppointment,
  getMedicalRecordsByDate,
} from "../controllers/medicalRecord.controller.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "record-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// All routes are protected with authentication
router.use(authenticate);

// Create medical record (doctor only)
router.post(
  "/",
  restrictTo("doctor", "admin"),
  upload.single("file"),
  validate(medicalRecordSchema),
  createMedicalRecord
);

// Get all medical records (admin only)
router.get("/", restrictTo("admin"), getMedicalRecords);

// Get medical record by ID
router.get("/:id", getMedicalRecordById);

// Update medical record (doctor only)
router.put(
  "/:id",
  restrictTo("doctor", "admin"),
  upload.single("file"),
  validate(medicalRecordSchema.partial()),
  updateMedicalRecord
);

// Delete medical record (doctor or admin only)
router.delete("/:id", restrictTo("doctor", "admin"), deleteMedicalRecord);

// Get medical records by patient
router.get("/patient/me", restrictTo("patient"), getMedicalRecordsByPatient);
router.get(
  "/patient/:patientId",
  restrictTo("admin"),
  getMedicalRecordsByPatient
);

// Get medical records by doctor
router.get("/doctor/me", restrictTo("doctor"), getMedicalRecordsByDoctor);
router.get("/doctor/:doctorId", restrictTo("admin"), getMedicalRecordsByDoctor);

// Get medical records by appointment
router.get("/appointment/:appointmentId", getMedicalRecordsByAppointment);

// Get medical records by date (admin only)
router.get("/date/:date", restrictTo("admin"), getMedicalRecordsByDate);

export default router;
