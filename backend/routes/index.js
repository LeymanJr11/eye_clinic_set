import express from "express";
import authRouter from "./auth.routes.js";
import adminRouter from "./admin.routes.js";
import doctorRouter from "./doctor.routes.js";
import patientRouter from "./patient.routes.js";
import appointmentRouter from "./appointment.routes.js";
import paymentRouter from "./payment.routes.js";
import medicalRecordRouter from "./medicalRecord.routes.js";
import feedbackRouter from "./feedback.routes.js";
import eyeTestRouter from "./eyeTest.routes.js";
import notificationRouter from "./notification.routes.js";
import timeSlotRouter from "./timeSlot.routes.js";
import medicationRoutes from "./medication.routes.js";
const router = express.Router();

// Auth routes
router.use("/auth", authRouter);

// Admin routes (protected)
router.use("/admins", adminRouter);

// Doctor routes (protected)
router.use("/doctors", doctorRouter);

// Patient routes (protected)
router.use("/patients", patientRouter);

// Appointment routes (protected)
router.use("/appointments", appointmentRouter);

// Payment routes (protected)
router.use("/payments", paymentRouter);

// Medical record routes (protected)
router.use("/medical-records", medicalRecordRouter);

// Feedback routes (protected)
router.use("/feedback", feedbackRouter);
router.use("/time-slots", timeSlotRouter);

// Eye test routes (protected)
router.use("/eye-tests", eyeTestRouter);

// Notification routes (protected)
router.use("/notifications", notificationRouter);

router.use("/medications", medicationRoutes);

export default router;
