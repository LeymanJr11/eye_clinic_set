import TimeSlot from "../models/timeSlots.model.js";
import Doctor from "../models/doctors.model.js";
import Appointment from "../models/appointments.model.js";
import { Op } from "sequelize";

// Create time slot (admin only)
export const createTimeSlot = async (req, res, next) => {
  try {
    const { doctor_id, start_time, end_time, day_of_week } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if time slot overlaps with existing slots
    const overlappingSlot = await TimeSlot.findOne({
      where: {
        doctor_id,
        day_of_week,
        [Op.and]: [
          { start_time: { [Op.lt]: end_time } },
          { end_time: { [Op.gt]: start_time } },
        ],
      },
    });

    if (overlappingSlot) {
      return res.status(409).json({
        success: false,
        message: "Time slot overlaps with existing slot",
      });
    }

    const timeSlot = await TimeSlot.create({
      doctor_id,
      start_time,
      end_time,
      day_of_week,
    });

    res.status(201).json({
      success: true,
      message: "Time slot created successfully",
      data: timeSlot,
    });
  } catch (error) {
    next(error);
  }
};

// Get all time slots (admin only)
export const getTimeSlots = async (req, res, next) => {
  try {
    const timeSlots = await TimeSlot.findAll({
      include: [
        {
          model: Doctor,
          attributes: ["name", "specialization"],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: timeSlots,
    });
  } catch (error) {
    next(error);
  }
};

// Get time slot by ID
export const getTimeSlotById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const timeSlot = await TimeSlot.findByPk(id, {
      include: [
        {
          model: Doctor,
          attributes: ["name", "specialization"],
        },
      ],
    });

    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    // Check if user has permission to view this time slot
    if (req.user.role === "doctor" && timeSlot.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this time slot",
      });
    }

    res.status(200).json({
      success: true,
      data: timeSlot,
    });
  } catch (error) {
    next(error);
  }
};

// Update time slot (admin only)
export const updateTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, day_of_week } = req.body;

    const timeSlot = await TimeSlot.findByPk(id);
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    // Check if time slot has any active appointments
    const hasActiveAppointments = await Appointment.findOne({
      where: {
        time_slot_id: id,
        status: {
          [Op.notIn]: ["cancelled"],
        },
      },
    });

    if (hasActiveAppointments) {
      return res.status(400).json({
        success: false,
        message: "Cannot update time slot with active appointments",
      });
    }

    // Check if time slot overlaps with existing slots
    const overlappingSlot = await TimeSlot.findOne({
      where: {
        doctor_id: timeSlot.doctor_id,
        day_of_week,
        id: {
          [Op.ne]: id,
        },
        [Op.and]: [
          { start_time: { [Op.lt]: end_time } },
          { end_time: { [Op.gt]: start_time } },
        ],
      },
    });

    if (overlappingSlot) {
      return res.status(409).json({
        success: false,
        message: "Time slot overlaps with existing slot",
      });
    }

    await timeSlot.update({
      start_time,
      end_time,
      day_of_week,
    });

    res.status(200).json({
      success: true,
      message: "Time slot updated successfully",
      data: timeSlot,
    });
  } catch (error) {
    next(error);
  }
};

// Delete time slot (admin only)
export const deleteTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const timeSlot = await TimeSlot.findByPk(id);
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    // Check if time slot has any active appointments
    const hasActiveAppointments = await Appointment.findOne({
      where: {
        time_slot_id: id,
        status: {
          [Op.notIn]: ["cancelled"],
        },
      },
    });

    if (hasActiveAppointments) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete time slot with active appointments",
      });
    }

    await timeSlot.destroy();

    res.status(200).json({
      success: true,
      message: "Time slot deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get time slots by doctor
export const getTimeSlotsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctor_id || req.user.id;

    // Check if user has permission to view these time slots
    if (req.user.role === "doctor" && doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view these time slots",
      });
    }

    const timeSlots = await TimeSlot.findAll({
      where: {
        doctor_id: doctorId,
      },
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: timeSlots,
    });
  } catch (error) {
    next(error);
  }
};

// Get available time slots for a doctor on a specific date
export const getAvailableTimeSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.doctor_id || req.user.id;
    const { date } = req.params;

    // Check if user has permission to view these time slots
    if (req.user.role === "doctor" && doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view these time slots",
      });
    }
    console.log(req.user);

    // Convert date to day of week
    const appointmentDay = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Get all time slots for the doctor on the specified day of week
    const timeSlots = await TimeSlot.findAll({
      where: {
        doctor_id: doctorId,
        day_of_week: appointmentDay,
      },
      order: [["start_time", "ASC"]],
    });

    if (timeSlots.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No time slots available for ${appointmentDay}`,
      });
    }

    // Get all appointments for the doctor on the specified date
    const appointments = await Appointment.findAll({
      where: {
        doctor_id: doctorId,
        appointment_date: date,
        status: {
          [Op.notIn]: ["cancelled"],
        },
      },
      include: [
        {
          model: TimeSlot,
          attributes: ["id", "start_time", "end_time"],
        },
      ],
    });

    // Create a set of booked time slot IDs
    const bookedTimeSlotIds = new Set(
      appointments.map((apt) => apt.time_slot_id)
    );

    // Filter out time slots that are already booked
    const availableTimeSlots = timeSlots.filter(
      (slot) => !bookedTimeSlotIds.has(slot.id)
    );

    res.status(200).json({
      success: true,
      data: availableTimeSlots,
    });
  } catch (error) {
    next(error);
  }
};
