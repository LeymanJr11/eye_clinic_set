import Appointment from "../models/appointments.model.js";
import Patient from "../models/patients.model.js";
import Doctor from "../models/doctors.model.js";
import TimeSlot from "../models/timeSlots.model.js";
import Notification from "../models/notifications.model.js";
import { Op } from "sequelize";

// Create appointment (admin or patient)
export const createAppointment = async (req, res, next) => {
  try {
    const { doctor_id, time_slot_id, appointment_date, status } = req.body;

    // If patient is creating, use their ID from the token
    const patient_id =
      req.user.role === "patient" ? req.user.id : req.body.patient_id;

    // Validate patient_id is provided for admin
    if (req.user.role === "admin" && !patient_id) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required when creating appointment as admin",
      });
    }

    // Check if time slot exists and belongs to the doctor
    const timeSlot = await TimeSlot.findOne({
      where: {
        id: time_slot_id,
        doctor_id: doctor_id,
      },
    });

    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message:
          "Time slot not found or does not belong to the specified doctor",
      });
    }

    // Check if the appointment date matches the time slot's day of week
    const appointmentDay = new Date(appointment_date).toLocaleDateString(
      "en-US",
      { weekday: "long" }
    );
    if (appointmentDay !== timeSlot.day_of_week) {
      return res.status(400).json({
        success: false,
        message: `Appointment date must be on a ${timeSlot.day_of_week}`,
      });
    }

    // Check if the appointment is for today and the slot is in the past
    const today = new Date();
    const appointmentDateObj = new Date(appointment_date);
    const isToday =
      today.getFullYear() === appointmentDateObj.getFullYear() &&
      today.getMonth() === appointmentDateObj.getMonth() &&
      today.getDate() === appointmentDateObj.getDate();
    if (isToday) {
      // Combine today's date with slot end_time
      const [endHour, endMinute, endSecond] = timeSlot.end_time
        .split(":")
        .map(Number);
      const slotEndDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        endHour,
        endMinute,
        endSecond || 0
      );
      if (today > slotEndDate) {
        return res.status(400).json({
          success: false,
          message: "Cannot book a time slot that has already passed.",
        });
      }
    }

    // Check if time slot is already booked
    const existingAppointment = await Appointment.findOne({
      where: {
        doctor_id,
        time_slot_id,
        appointment_date,
        status: {
          [Op.notIn]: ["cancelled"],
        },
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    // Check if patient already has an appointment at this time
    const patientAppointment = await Appointment.findOne({
      where: {
        patient_id,
        appointment_date,
        time_slot_id,
        status: {
          [Op.notIn]: ["cancelled"],
        },
      },
    });

    if (patientAppointment) {
      return res.status(409).json({
        success: false,
        message: "You already have an appointment at this time",
      });
    }

    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      time_slot_id,
      appointment_date,
      status: status || "scheduled",
    });

    // Create notification for the patient
    try {
      await Notification.create({
        patient_id,
        message: `Your appointment has been scheduled for ${new Date(
          appointment_date
        ).toLocaleDateString()}. Please arrive 10 minutes before your scheduled time.`,
        type: "appointment",
        is_read: false,
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the main operation if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Get all appointments (admin only)
export const getAppointments = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};

    // Add date range filter only if both dates are provided
    if (startDate && endDate) {
      whereClause.appointment_date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      order: [["appointment_date", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: TimeSlot, attributes: ["start_time", "end_time"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: TimeSlot, attributes: ["start_time", "end_time"] },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if user has permission to view this appointment
    if (req.user.role === "doctor" && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this appointment",
      });
    }

    if (req.user.role === "patient" && appointment.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this appointment",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { time_slot_id, appointment_date, status } = req.body;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Doctor, attributes: ["id"] },
        { model: TimeSlot, attributes: ["day_of_week", "doctor_id"] },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check permissions
    if (req.user.role === "doctor" && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this appointment",
      });
    }

    if (req.user.role === "patient" && appointment.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this appointment",
      });
    }

    // If updating time slot, check if it exists and belongs to the doctor
    if (time_slot_id) {
      const timeSlot = await TimeSlot.findOne({
        where: {
          id: time_slot_id,
          doctor_id: appointment.doctor_id,
        },
      });

      if (!timeSlot) {
        return res.status(404).json({
          success: false,
          message: "Time slot not found or does not belong to the doctor",
        });
      }

      // Check if the appointment date matches the time slot's day of week
      if (appointment_date) {
        const appointmentDay = new Date(appointment_date).toLocaleDateString(
          "en-US",
          { weekday: "long" }
        );
        if (appointmentDay !== timeSlot.day_of_week) {
          return res.status(400).json({
            success: false,
            message: `Appointment date must be on a ${timeSlot.day_of_week}`,
          });
        }
      }

      // Check if time slot is already booked
      const existingAppointment = await Appointment.findOne({
        where: {
          doctor_id: appointment.doctor_id,
          time_slot_id,
          appointment_date: appointment_date || appointment.appointment_date,
          status: {
            [Op.notIn]: ["cancelled"],
          },
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (existingAppointment) {
        return res.status(409).json({
          success: false,
          message: "This time slot is already booked",
        });
      }

      // Check if patient already has an appointment at this time
      const patientAppointment = await Appointment.findOne({
        where: {
          patient_id: appointment.patient_id,
          appointment_date: appointment_date || appointment.appointment_date,
          time_slot_id,
          status: {
            [Op.notIn]: ["cancelled"],
          },
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (patientAppointment) {
        return res.status(409).json({
          success: false,
          message: "Patient already has an appointment at this time",
        });
      }
    }

    await appointment.update({
      time_slot_id: time_slot_id || appointment.time_slot_id,
      appointment_date: appointment_date || appointment.appointment_date,
      status: status || appointment.status,
    });

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete appointment
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check permissions
    if (req.user.role === "doctor" && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this appointment",
      });
    }

    if (req.user.role === "patient" && appointment.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this appointment",
      });
    }

    await appointment.destroy();

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get appointments by date
export const getAppointmentsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;

    const appointments = await Appointment.findAll({
      where: {
        appointment_date: date,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: TimeSlot, attributes: ["start_time", "end_time"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// Get appointments by doctor
export const getAppointmentsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctor_id || req.user.id;
    const { startDate, endDate } = req.query;

    const whereClause = {
      doctor_id: doctorId,
    };

    // Add date range filter only if both dates are provided
    if (startDate && endDate) {
      whereClause.appointment_date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      order: [["appointment_date", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: TimeSlot, attributes: ["start_time", "end_time"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// Get appointments by patient
export const getAppointmentsByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.patient_id || req.user.id;
    const { startDate, endDate } = req.query;

    const whereClause = {
      patient_id: patientId,
    };

    // Add date range filter only if both dates are provided
    if (startDate && endDate) {
      whereClause.appointment_date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      order: [["appointment_date", "DESC"]],
      include: [
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: TimeSlot, attributes: ["start_time", "end_time"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Only doctor or admin can update status
    if (req.user.role === "doctor" && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this appointment status",
      });
    }

    const oldStatus = appointment.status;
    await appointment.update({ status });

    // Create notification for status changes
    try {
      let message = "";
      switch (status) {
        case "confirmed":
          message = `Your appointment has been confirmed for ${new Date(
            appointment.appointment_date
          ).toLocaleDateString()}. Please arrive 10 minutes before your scheduled time.`;
          break;
        case "completed":
          message = `Your appointment has been marked as completed. Thank you for visiting us!`;
          break;
        case "cancelled":
          message = `Your appointment has been cancelled. Please contact us to reschedule if needed.`;
          break;
        case "rescheduled":
          message = `Your appointment has been rescheduled for ${new Date(
            appointment.appointment_date
          ).toLocaleDateString()}. Please check your updated appointment details.`;
          break;
        default:
          message = `Your appointment status has been updated to ${status}.`;
      }

      if (message && oldStatus !== status) {
        await Notification.create({
          patient_id: appointment.patient_id,
          message,
          type: "appointment",
          is_read: false,
        });
      }
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the main operation if notification fails
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
