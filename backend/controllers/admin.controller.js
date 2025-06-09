import Admin from "../models/admins.model.js";
import Doctor from "../models/doctors.model.js";
import Patient from "../models/patients.model.js";
import Appointment from "../models/appointments.model.js";
import Payment from "../models/payments.model.js";
import { Op } from "sequelize";

// Create admin
export const createAdmin = async (req, res, next) => {
  try {
    const { name, wallet_address } = req.body;

    // Validate name format
    if (!/^[a-zA-Z\s]{2,100}$/.test(name)) {
      return res.status(400).json({
        success: false,
        message:
          "Name must only contain letters and spaces, between 2-100 characters",
      });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ethereum wallet address format",
      });
    }

    // Check if admin with wallet address already exists
    const existingAdmin = await Admin.findOne({ where: { wallet_address } });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin with this wallet address already exists",
      });
    }

    const admin = await Admin.create({ name, wallet_address });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// Get all admins
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

// Get admin by ID
export const getAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// Update admin
export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, wallet_address } = req.body;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
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

    // Validate wallet address format
    if (wallet_address && !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ethereum wallet address format",
      });
    }

    // If updating wallet address, check for duplicates
    if (wallet_address && wallet_address !== admin.wallet_address) {
      const existingAdmin = await Admin.findOne({ where: { wallet_address } });
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: "Admin with this wallet address already exists",
        });
      }
    }

    await admin.update({ name, wallet_address });

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// Delete admin
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await admin.destroy();

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalRevenue,
      recentAppointments,
    ] = await Promise.all([
      Doctor.count(),
      Patient.count(),
      Appointment.count(),
      Payment.sum("amount", {
        where: { status: "completed" },
      }),
      Appointment.findAll({
        limit: 5,
        order: [["createdAt", "DESC"]],
        include: [
          { model: Doctor, attributes: ["name"] },
          { model: Patient, attributes: ["name"] },
        ],
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalRevenue: totalRevenue || 0,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
