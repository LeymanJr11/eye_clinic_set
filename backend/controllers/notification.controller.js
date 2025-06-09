import Notification from "../models/notifications.model.js";
import Patient from "../models/patients.model.js";
import { Op } from "sequelize";

// Create notification
export const createNotification = async (req, res, next) => {
  try {
    const { patient_id, message, type, is_read } = req.body;

    const notification = await Notification.create({
      patient_id,
      message,
      type,
      is_read: is_read || false,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Get all notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Get notification by ID
export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id, {
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Update notification
export const updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, type, is_read } = req.body;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.update({
      message,
      type,
      is_read,
    });

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.destroy();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get notifications by patient
export const getNotificationsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const notifications = await Notification.findAll({
      where: {
        patient_id: patientId,
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Get notifications by type
export const getNotificationsByType = async (req, res, next) => {
  try {
    const { type } = req.params;

    const notifications = await Notification.findAll({
      where: {
        type,
      },
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Get unread notifications
export const getUnreadNotifications = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const notifications = await Notification.findAll({
      where: {
        patient_id: patientId,
        is_read: false,
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.update({ is_read: true });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    await Notification.update(
      { is_read: true },
      {
        where: {
          patient_id: patientId,
          is_read: false,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};
