import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import { eyeTestSchema } from "../validators/validator.js";
import { authenticate, restrictTo } from "../middlewares/authmiddleware.js";
import {
  createEyeTest,
  getEyeTests,
  getEyeTestById,
  updateEyeTest,
  deleteEyeTest,
  getEyeTestsByPatient,
  getEyeTestsByDate,
} from "../controllers/eyeTest.controller.js";

const router = express.Router();

// All routes are protected with authentication
router.use(authenticate);

// Create eye test (admin or patient)
router.post(
  "/",
  restrictTo("admin", "patient"),
  validate(eyeTestSchema),
  createEyeTest
);

// Get all eye tests (admin only)
router.get("/", restrictTo("admin"), getEyeTests);

// Get eye test by ID
router.get("/:id", getEyeTestById);

// Update eye test (admin only)
router.put(
  "/:id",
  restrictTo("admin"),
  validate(eyeTestSchema.partial()),
  updateEyeTest
);

// Delete eye test (admin or patient)
router.delete("/:id", restrictTo("admin", "patient"), deleteEyeTest);

// Get eye tests by patient
router.get("/patient/me", restrictTo("patient"), getEyeTestsByPatient);

router.get("/patient/:patientId", restrictTo("admin"), getEyeTestsByPatient);

// Get eye tests by date (admin only)
router.get("/date/:date", restrictTo("admin"), getEyeTestsByDate);

export default router;
