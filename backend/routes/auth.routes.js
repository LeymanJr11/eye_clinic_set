import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import {
  adminSchema,
  doctorSchema,
  patientSchema,
} from "../validators/validator.js";
import {
  loginAdmin,
  loginDoctor,
  loginPatient,
  registerPatient,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Admin login route (MetaMask)
router.post(
  "/admin/login",
  validate(adminSchema.pick({ wallet_address: true })),
  loginAdmin
);

// Doctor login route
router.post(
  "/doctor/login",
  validate(doctorSchema.pick({ email: true, password: true })),
  loginDoctor
);

// Patient login route
router.post(
  "/patient/login",
  validate(patientSchema.pick({ phone: true, password: true })),
  loginPatient
);

// Patient registration route
router.post("/patient/register", validate(patientSchema), registerPatient);

export default router;
