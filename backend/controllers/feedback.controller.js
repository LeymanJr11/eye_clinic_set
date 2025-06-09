import Feedback from "../models/feedback.model.js";
import Patient from "../models/patients.model.js";
import Doctor from "../models/doctors.model.js";
import Appointment from "../models/appointments.model.js";

// Create feedback (patient only)
export const createFeedback = async (req, res, next) => {
  try {
    const { appointment_id, rating, comment } = req.body;

    // Check if appointment exists and belongs to patient
    const appointment = await Appointment.findOne({
      where: {
        id: appointment_id,
        patient_id: req.user.id,
      },
      include: [{ model: Doctor, attributes: ["id"] }],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to leave feedback",
      });
    }
    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only leave feedback for completed appointments",
      });
    }

    // Check if feedback already exists for this appointment
    const existingFeedback = await Feedback.findOne({
      where: {
        appointment_id,
      },
    });

    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message: "Feedback already exists for this appointment",
      });
    }

    const feedback = await Feedback.create({
      patient_id: req.user.id,
      doctor_id: appointment.doctor_id,
      appointment_id,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// Get all feedback (admin only)
export const getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// Get feedback by ID
export const getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id, {
      include: [
        { model: Patient, attributes: ["name"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Check if user has permission to view this feedback
    if (req.user.role === "doctor" && feedback.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this feedback",
      });
    }

    if (req.user.role === "patient" && feedback.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this feedback",
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// Update feedback (patient only)
export const updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Only the patient who created the feedback can update it
    if (feedback.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this feedback",
      });
    }

    await feedback.update({
      rating,
      comment,
    });

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// Delete feedback (patient or admin)
export const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Only the patient who created the feedback or admin can delete it
    if (req.user.role !== "admin" && feedback.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this feedback",
      });
    }

    await feedback.destroy();

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get feedbacks by doctor
export const getFeedbacksByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctor_id || req.user.id;

    const feedbacks = await Feedback.findAll({
      where: {
        doctor_id: doctorId,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// Get feedbacks by patient
export const getFeedbacksByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.patient_id || req.user.id;

    const feedbacks = await Feedback.findAll({
      where: {
        patient_id: patientId,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
export const getFeedbacksByPatientforappointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.appointment_id;
    const patientId = req.user.id;

    const feedbacks = await Feedback.findAll({
      where: {
        patient_id: patientId,
        appointment_id: appointmentId,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
