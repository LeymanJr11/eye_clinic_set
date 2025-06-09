import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import { adminSchema } from "../validators/validator.js";
import { authenticate } from "../middlewares/authmiddleware.js";
import {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getAdminDashboardStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All routes are protected with authentication and admin role
router.use(authenticate);

// Create admin
router.post("/", validate(adminSchema), createAdmin);

// Get all admins
router.get("/", getAdmins);

// Get admin by ID
router.get("/:id", getAdminById);

// Update admin
router.put("/:id", validate(adminSchema.partial()), updateAdmin);

// Delete admin
router.delete("/:id", deleteAdmin);

// Get dashboard statistics
router.get("/dashboard/stats", getAdminDashboardStats);

export default router;
