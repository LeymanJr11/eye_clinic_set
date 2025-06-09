import { z } from "zod";

// Admin Schema (MetaMask login)
export const adminSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  wallet_address: z
    .string()
    .min(42, "Invalid wallet address")
    .max(255, "Wallet address cannot exceed 255 characters")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address format"),
});

// Patient Schema
export const patientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password cannot exceed 255 characters"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .optional(),
  gender: z.enum(["male", "female"]).optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
});

// Doctor Schema
export const doctorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password cannot exceed 255 characters"),
  specialization: z
    .string()
    .max(100, "Specialization cannot exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .optional(),
  address: z.string().optional(),
});

// TimeSlot Schema
export const timeSlotSchema = z.object({
  doctor_id: z.number().int("Doctor ID must be an integer"),
  day_of_week: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Invalid time format"),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Invalid time format"),
});

// Appointment Schema
export const appointmentSchema = z.object({
  // patient_id: z.number().int("Patient ID must be an integer"),
  doctor_id: z.number().int("Doctor ID must be an integer"),
  time_slot_id: z.number().int("Time slot ID must be an integer"),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});

// Payment Schema
export const paymentSchema = z.object({
  appointment_id: z.number().int("Appointment ID must be an integer"),
  amount: z
    .number()
    .positive("Amount must be a positive number")
    .max(100000, "Amount cannot exceed 100,000"),
  status: z.enum(["pending", "paid", "failed"]).default("pending"),
  payment_type: z.enum([
    "initial_consultation",
    "followup",
    "test",
    "prescription",
    "other",
  ]),
});

// Medical Record Schema
export const medicalRecordSchema = z.object({
  patient_id: z.coerce.number().int("Patient ID must be an integer"),
  doctor_id: z.coerce.number().int("Doctor ID must be an integer"),
  appointment_id: z.coerce
    .number()
    .int("Appointment ID must be an integer")
    .optional(),
  record_type: z.enum([
    "diagnosis",
    "prescription",
    "test_result",
    "external_upload",
  ]),
  description: z.string().optional(),
  file_url: z.string().optional(),
});

// Feedback Schema
export const feedbackSchema = z.object({
  appointment_id: z.number().int("Appointment ID must be an integer"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

// Eye Test Schema
export const eyeTestSchema = z.object({
  patient_id: z.number().int("Patient ID must be an integer"),
  test_type: z.enum([
    "color_blindness",
    "visual_acuity",
    "contrast_sensitivity",
  ]),
  result: z.string().max(100, "Result cannot exceed 100 characters").optional(),
});

// Notification Schema
export const notificationSchema = z.object({
  patient_id: z.number().int("Patient ID must be an integer"),
  message: z.string().min(1, "Message cannot be empty"),
  type: z.enum(["appointment", "medication", "general"]),
  is_read: z.boolean().default(false),
});
