import bcrypt from "bcryptjs";
import Patient from "../models/patients.model.js";
import Appointment from "../models/appointments.model.js";
import MedicalRecord from "../models/medicalRecords.model.js";
import Payment from "../models/payments.model.js";
import EyeTest from "../models/eyeTests.model.js";
import { Op } from "sequelize";

// Create patient
export const createPatient = async (req, res, next) => {
  try {
    const { name, password, phone, gender, date_of_birth } = req.body;

    // Validate name format
    if (!/^[a-zA-Z\s]{2,100}$/.test(name)) {
      return res.status(400).json({
        success: false,
        message:
          "Name must only contain letters and spaces, between 2-100 characters",
      });
    }

    // Validate phone format
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    // Validate date of birth format
    if (date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
      return res.status(400).json({
        success: false,
        message: "Date of birth must be in YYYY-MM-DD format",
      });
    }

    // Check if patient with phone already exists
    if (phone) {
      const existingPhone = await Patient.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Patient with this phone number already exists",
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const patient = await Patient.create({
      name,
      password: password_hash,
      phone,
      gender,
      date_of_birth,
    });

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        gender: patient.gender,
        date_of_birth: patient.date_of_birth,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all patients
export const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// Get patient by ID
export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Update patient
export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, password, phone, gender, date_of_birth } = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Validate name format
    if (name && !/^[a-zA-Z\s]{2,100}$/.test(name)) {
      return res.status(400).json({
        success: false,
        message:
          "Name must only contain letters and spaces, between 2-100 characters",
      });
    }

    // Validate phone format
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    // Validate date of birth format
    if (date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
      return res.status(400).json({
        success: false,
        message: "Date of birth must be in YYYY-MM-DD format",
      });
    }

    // If updating phone, check for duplicates
    if (phone && phone !== patient.phone) {
      const existingPhone = await Patient.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Patient with this phone number already exists",
        });
      }
    }

    // If updating password, hash it
    let password_hash = patient.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }

    await patient.update({
      name,
      password: password_hash,
      phone,
      gender,
      date_of_birth,
    });

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        gender: patient.gender,
        date_of_birth: patient.date_of_birth,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete patient
export const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    await patient.destroy();

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
export const getPatientDashboardStats = async (req, res, next) => {
  try {
    const patientId = req.user.id;

    const [
      totalAppointments,
      upcomingAppointments,
      totalPayments,
      recentMedicalRecords,
    ] = await Promise.all([
      Appointment.count({
        where: { patient_id: patientId },
      }),
      Appointment.count({
        where: {
          patient_id: patientId,
          appointment_date: {
            [Op.gte]: new Date(),
          },
          status: "scheduled",
        },
      }),
      Payment.sum("amount", {
        where: {
          patient_id: patientId,
          status: "completed",
        },
      }),
      MedicalRecord.findAll({
        where: { patient_id: patientId },
        limit: 5,
        order: [["createdAt", "DESC"]],
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        upcomingAppointments,
        totalPayments: totalPayments || 0,
        recentMedicalRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get patient's appointments
export const getPatientAppointments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointments = await Appointment.findAll({
      where: { patient_id: id },
      order: [["appointment_date", "DESC"]],
      include: [{ model: Doctor, attributes: ["name", "specialization"] }],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// Get patient's medical records
export const getPatientMedicalRecords = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medicalRecords = await MedicalRecord.findAll({
      where: { patient_id: id },
      order: [["createdAt", "DESC"]],
      include: [{ model: Doctor, attributes: ["name", "specialization"] }],
    });

    res.status(200).json({
      success: true,
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
};

// Get patient's payments
export const getPatientPayments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payments = await Payment.findAll({
      where: { patient_id: id },
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

// Get patient's eye tests
export const getPatientEyeTests = async (req, res, next) => {
  try {
    const { id } = req.params;

    const eyeTests = await EyeTest.findAll({
      where: { patient_id: id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: eyeTests,
    });
  } catch (error) {
    next(error);
  }
};
