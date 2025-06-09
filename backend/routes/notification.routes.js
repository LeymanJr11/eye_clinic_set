import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import { notificationSchema } from "../validators/validator.js";
import { authenticate, restrictTo } from "../middlewares/authmiddleware.js";
import {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationsByPatient,
  getNotificationsByType,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// All routes are protected with authentication
router.use(authenticate);

// Create notification
router.post("/", validate(notificationSchema), createNotification);

// Get all notifications
router.get("/", getNotifications);

// Get notification by ID
router.get("/:id", getNotificationById);

// Update notification
router.put("/:id", validate(notificationSchema.partial()), updateNotification);

// Delete notification
router.delete("/:id", deleteNotification);

// Get notifications by patient
router.get("/patient/:patientId", getNotificationsByPatient);

// Get notifications by type
router.get("/type/:type", getNotificationsByType);

// Get unread notifications
router.get("/patient/:patientId/unread", getUnreadNotifications);

// Mark notification as read
router.patch("/:id/read", markNotificationAsRead);

// Mark all notifications as read
router.patch("/patient/:patientId/read-all", markAllNotificationsAsRead);

export default router;
