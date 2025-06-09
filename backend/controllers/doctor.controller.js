import bcrypt from "bcryptjs";
import Doctor from "../models/doctors.model.js";
import Patient from "../models/patients.model.js";
import Appointment from "../models/appointments.model.js";
import MedicalRecord from "../models/medicalRecords.model.js";
import { Op } from "sequelize";

// Create doctor
export const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, phone, address } = req.body;

    // Validate name format
    if (!/^[a-zA-Z\s]{2,100}$/.test(name)) {
      return res.status(400).json({
        success: false,
        message:
          "Name must only contain letters and spaces, between 2-100 characters",
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone format
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    // Check if doctor with email already exists
    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    // Check if doctor with phone already exists
    if (phone) {
      const existingPhone = await Doctor.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Doctor with this phone number already exists",
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const doctor = await Doctor.create({
      name,
      email,
      password: password_hash,
      specialization,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        phone: doctor.phone,
        address: doctor.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all doctors
export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// Update doctor
export const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, specialization, phone, address } = req.body;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
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

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone format
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    // If updating email, check for duplicates
    if (email && email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({ where: { email } });
      if (existingDoctor) {
        return res.status(409).json({
          success: false,
          message: "Doctor with this email already exists",
        });
      }
    }

    // If updating phone, check for duplicates
    if (phone && phone !== doctor.phone) {
      const existingPhone = await Doctor.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Doctor with this phone number already exists",
        });
      }
    }

    // If updating password, hash it
    let password_hash = doctor.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }

    await doctor.update({
      name,
      email,
      password: password_hash,
      specialization,
      phone,
      address,
    });

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        phone: doctor.phone,
        address: doctor.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete doctor
export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await doctor.destroy();

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
export const getDoctorDashboardStats = async (req, res, next) => {
  try {
    const doctorId = req.user.id;

    const [
      totalPatients,
      totalAppointments,
      todayAppointments,
      recentMedicalRecords,
    ] = await Promise.all([
      Patient.count({
        include: [
          {
            model: Appointment,
            where: { doctor_id: doctorId },
          },
        ],
        distinct: true,
      }),
      Appointment.count({
        where: { doctor_id: doctorId },
      }),
      Appointment.count({
        where: {
          doctor_id: doctorId,
          appointment_date: {
            [Op.gte]: new Date().setHours(0, 0, 0, 0),
            [Op.lt]: new Date().setHours(23, 59, 59, 999),
          },
        },
      }),
      MedicalRecord.findAll({
        where: { doctor_id: doctorId },
        limit: 5,
        order: [["createdAt", "DESC"]],
        include: [{ model: Patient, attributes: ["name"] }],
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalAppointments,
        todayAppointments,
        recentMedicalRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointments = await Appointment.findAll({
      where: { doctor_id: id },
      order: [["appointment_date", "DESC"]],
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor's patients
export const getDoctorPatients = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patients = await Patient.findAll({
      include: [
        {
          model: Appointment,
          where: { doctor_id: id },
          required: true,
        },
      ],
      distinct: true,
    });

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor's medical records
export const getDoctorMedicalRecords = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medicalRecords = await MedicalRecord.findAll({
      where: { doctor_id: id },
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["name"] }],
    });

    res.status(200).json({
      success: true,
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
};
