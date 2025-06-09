import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import { paymentSchema } from "../validators/validator.js";
import { authenticate, restrictTo } from "../middlewares/authmiddleware.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentsByPatient,
  getPaymentsByDate,
  getPaymentsByStatus,
  updatePaymentStatus,
  getPaymentsByAppointment,
  processPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

// All routes are protected with authentication
router.use(authenticate);

// Create payment (admin or patient)
router.post(
  "/",
  restrictTo("admin", "patient"),
  validate(paymentSchema),
  createPayment
);

// Get all payments (admin only)
router.get("/", restrictTo("admin"), getPayments);

// Get payment by ID
router.get("/:id", getPaymentById);

// Update payment (admin only)
router.put(
  "/:id",
  restrictTo("admin"),
  validate(paymentSchema.partial()),
  updatePayment
);

// Delete payment (admin only)
router.delete("/:id", restrictTo("admin"), deletePayment);

// Get payments by patient
router.get("/patient/me", restrictTo("patient"), getPaymentsByPatient);
router.get("/patient/:patientId", restrictTo("admin"), getPaymentsByPatient);

// Get payments by appointment
router.get("/appointment/:appointmentId", getPaymentsByAppointment);

// Get payments by date (admin only)
router.get("/date/:date", restrictTo("admin"), getPaymentsByDate);

// Get payments by status (admin only)
router.get("/status/:status", restrictTo("admin"), getPaymentsByStatus);

// Process payment (patient only)
router.post("/:id/process", restrictTo("patient"), processPayment);

// Update payment status (admin only)
router.patch(
  "/:id/status",
  restrictTo("admin"),
  validate(paymentSchema.pick({ status: true })),
  updatePaymentStatus
);

export default router;
