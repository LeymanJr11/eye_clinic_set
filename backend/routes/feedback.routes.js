import express from "express";
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbacksByDoctor,
  getFeedbacksByPatient,
  getFeedbacksByPatientforappointment,
} from "../controllers/feedback.controller.js";
import { authenticate, restrictTo } from "../middlewares/authmiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { feedbackSchema } from "../validators/validator.js";

const router = express.Router();

// Create feedback (patient only)
router.post(
  "/",
  authenticate,
  restrictTo("patient"),
  validate(feedbackSchema),
  createFeedback
);

// Get all feedback (admin only)
router.get("/", authenticate, restrictTo("admin"), getFeedbacks);

// Get feedbacks by doctor
router.get(
  "/doctor/me",
  authenticate,
  restrictTo("doctor"),
  getFeedbacksByDoctor
);

router.get(
  "/doctor/:doctor_id",
  authenticate,
  restrictTo("admin"),
  getFeedbacksByDoctor
);

// Get feedbacks by patient
router.get(
  "/patient/me",
  authenticate,
  restrictTo("patient"),
  getFeedbacksByPatient
);

router.get(
  "/patient/:patient_id",
  authenticate,
  restrictTo("admin"),
  getFeedbacksByPatient
);
// Get feedbacks by patient
router.get(
  "/appointment/:appointment_id",
  authenticate,
  restrictTo("patient"),
  getFeedbacksByPatientforappointment
);
// Get feedback by ID
router.get("/:id", authenticate, getFeedbackById);

// Update feedback (patient only)
router.put(
  "/:id",
  authenticate,
  restrictTo("patient"),
  validate(feedbackSchema.partial()),
  updateFeedback
);

// Delete feedback (patient or admin)
router.delete(
  "/:id",
  authenticate,
  restrictTo("patient", "admin"),
  deleteFeedback
);

export default router;
