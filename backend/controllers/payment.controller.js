import Payment from "../models/payments.model.js";
import Patient from "../models/patients.model.js";
import Appointment from "../models/appointments.model.js";
import Notification from "../models/notifications.model.js";
import { initiateWaafiPayment } from "../services/payment.service.js";
import { Op } from "sequelize";
import sequelize from "../database/db.js";

// Create payment
export const createPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { appointment_id, amount, payment_type, note } = req.body;

    // If patient is creating, use their ID from token
    const patient_id =
      req.user.role === "patient" ? req.user.id : req.body.patient_id;

    // Validate appointment exists and belongs to patient if patient is creating
    const appointment = await Appointment.findOne({
      where: {
        id: appointment_id,
        ...(req.user.role === "patient" ? { patient_id: req.user.id } : {}),
      },
      include: [{ model: Patient, attributes: ["phone"] }],
    });

    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to create payment",
      });
    }

    const payment = await Payment.create(
      {
        appointment_id,
        patient_id: appointment.patient_id, // Get patient_id from appointment
        amount,
        status: "pending",
        payment_type,
        note,
      },
      { transaction }
    );

    // Create notification for the patient
    try {
      await Notification.create({
        patient_id: appointment.patient_id,
        message: `Payment of $${amount} has been created for your appointment. Please complete the payment to confirm your appointment.`,
        type: "general",
        is_read: false,
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the main operation if notification fails
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get payments by appointment
export const getPaymentsByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    // Check if appointment exists and belongs to patient if patient is requesting
    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        ...(req.user.role === "patient" ? { patient_id: req.user.id } : {}),
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to view payments",
      });
    }

    const payments = await Payment.findAll({
      where: {
        appointment_id: appointmentId,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// Process payment
export const processPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    // First get the patient to ensure we have their phone number
    const patient = await Patient.findByPk(req.user.id);
    if (!patient || !patient.phone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Patient phone number is required for payment processing",
      });
    }

    const payment = await Payment.findOne({
      where: {
        id,
        patient_id: req.user.id,
        status: "pending",
      },
      include: [
        {
          model: Patient,
          attributes: ["phone"],
          required: true,
        },
        {
          model: Appointment,
          attributes: ["appointment_date"],
        },
      ],
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Payment not found or already processed",
      });
    }

    // Process payment with Waafi
    try {
      const paymentResult = await initiateWaafiPayment(
        patient.phone, // Use the phone from the patient record
        parseFloat(payment.amount),
        payment.id
      );

      if (!paymentResult.success) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Payment processing failed",
          details: paymentResult.data,
        });
      }

      // Update payment record
      await payment.update(
        {
          status: "paid",
          transaction_ref: paymentResult.referenceId,
        },
        { transaction }
      );

      // Create notification for successful payment
      try {
        await Notification.create({
          patient_id: payment.patient_id,
          message: `Payment of $${payment.amount} has been processed successfully. Your appointment is now confirmed.`,
          type: "general",
          is_read: false,
        });
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the main operation if notification fails
      }

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        data: payment,
      });
    } catch (paymentError) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Payment processing failed: ${paymentError.message}`,
      });
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get all payments (admin only)
export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get payment by ID
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if user has permission to view this payment
    if (req.user.role === "patient" && payment.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this payment",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// Update payment (admin only)
export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, status, payment_type } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await payment.update({
      amount,
      status,
      payment_type,
    });

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete payment (admin only)
export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await payment.destroy();

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get payments by patient
export const getPaymentsByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.user.id;

    // Check if user has permission to view these payments
    if (req.user.role === "patient" && patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view these payments",
      });
    }

    const payments = await Payment.findAll({
      where: {
        patient_id: patientId,
      },
      order: [["createdAt", "DESC"]],
      include: [{ model: Appointment, attributes: ["appointment_date"] }],
    });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get payments by date (admin only)
export const getPaymentsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;

    const payments = await Payment.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(date).setHours(0, 0, 0, 0),
          [Op.lt]: new Date(date).setHours(23, 59, 59, 999),
        },
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get payments by status (admin only)
export const getPaymentsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    const payments = await Payment.findAll({
      where: {
        status,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// Update payment status (admin only)
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const oldStatus = payment.status;
    await payment.update({ status });

    // Create notification for status changes
    try {
      let message = "";
      switch (status) {
        case "paid":
          message = `Your payment of $${payment.amount} has been confirmed. Thank you!`;
          break;
        case "failed":
          message = `Your payment of $${payment.amount} has failed. Please try again or contact support.`;
          break;
        case "refunded":
          message = `Your payment of $${payment.amount} has been refunded. Please check your account.`;
          break;
        default:
          message = `Your payment status has been updated to ${status}.`;
      }

      if (message && oldStatus !== status) {
        await Notification.create({
          patient_id: payment.patient_id,
          message,
          type: "general",
          is_read: false,
        });
      }
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the main operation if notification fails
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
