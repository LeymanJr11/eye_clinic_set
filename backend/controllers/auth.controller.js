import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import Admin from "../models/admins.model.js";
import Doctor from "../models/doctors.model.js";
import Patient from "../models/patients.model.js";
import { validationResult } from "express-validator";

// Helper function to generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Admin Login with MetaMask
export const loginAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { wallet_address } = req.body;

    const admin = await Admin.findOne({ where: { wallet_address } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const token = generateToken({ id: admin.id, role: "admin" });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          wallet_address: admin.wallet_address,
          role: "admin",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Doctor Login
export const loginDoctor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken({ id: doctor.id, role: "doctor" });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        doctor: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
          role: "doctor",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Patient Login
export const loginPatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;

    const patient = await Patient.findOne({ where: { phone } });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken({ id: patient.id, role: "patient" });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        patient: {
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
          role: "patient",
          gender: patient.gender,
          date_of_birth: patient.date_of_birth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Patient Registration
export const registerPatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password, phone, gender, date_of_birth } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ where: { phone } });
    if (existingPatient) {
      return res
        .status(409)
        .json({ message: "Phone number already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create new patient
    const patient = await Patient.create({
      name,
      password: password_hash,
      phone,
      gender,
      date_of_birth,
    });

    // Generate token
    const token = generateToken({ id: patient.id, role: "patient" });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: {
        token,
        patient: {
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
          role: "patient",
          gender: patient.gender,
          date_of_birth: patient.date_of_birth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
