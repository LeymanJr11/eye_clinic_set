import EyeTest from "../models/eyeTests.model.js";
import Patient from "../models/patients.model.js";
import { Op } from "sequelize";

// Create eye test
export const createEyeTest = async (req, res, next) => {
  try {
    const { patient_id, test_type, result } = req.body;

    // If patient is creating, use their ID from the token
    const actualPatientId =
      req.user.role === "patient" ? req.user.id : patient_id;

    // Validate patient_id is provided for admin
    if (req.user.role === "admin" && !patient_id) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required when creating eye test as admin",
      });
    }

    const eyeTest = await EyeTest.create({
      patient_id: actualPatientId,
      test_type,
      result,
    });

    res.status(201).json({
      success: true,
      message: "Eye test created successfully",
      data: eyeTest,
    });
  } catch (error) {
    next(error);
  }
};

// Get all eye tests
export const getEyeTests = async (req, res, next) => {
  try {
    const { startDate, endDate, patient_id } = req.query;

    const whereClause = {};

    // Add date range filter only if both dates are provided
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Add patient filter if provided
    if (patient_id) {
      whereClause.patient_id = patient_id;
    }

    const eyeTests = await EyeTest.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    res.status(200).json({
      success: true,
      data: eyeTests,
    });
  } catch (error) {
    next(error);
  }
};

// Get eye test by ID
export const getEyeTestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const eyeTest = await EyeTest.findByPk(id, {
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    if (!eyeTest) {
      return res.status(404).json({
        success: false,
        message: "Eye test not found",
      });
    }

    // Check if user has permission to view this eye test
    if (req.user.role === "patient" && eyeTest.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this eye test",
      });
    }

    res.status(200).json({
      success: true,
      data: eyeTest,
    });
  } catch (error) {
    next(error);
  }
};

// Update eye test
export const updateEyeTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { test_type, result } = req.body;

    const eyeTest = await EyeTest.findByPk(id);
    if (!eyeTest) {
      return res.status(404).json({
        success: false,
        message: "Eye test not found",
      });
    }

    await eyeTest.update({
      test_type,
      result,
    });

    res.status(200).json({
      success: true,
      message: "Eye test updated successfully",
      data: eyeTest,
    });
  } catch (error) {
    next(error);
  }
};

// Delete eye test
export const deleteEyeTest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const eyeTest = await EyeTest.findByPk(id);
    if (!eyeTest) {
      return res.status(404).json({
        success: false,
        message: "Eye test not found",
      });
    }

    // Check if user has permission to delete this eye test
    if (req.user.role === "patient" && eyeTest.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this eye test",
      });
    }

    await eyeTest.destroy();

    res.status(200).json({
      success: true,
      message: "Eye test deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get eye tests by patient
export const getEyeTestsByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    const { startDate, endDate } = req.query;

    const whereClause = {
      patient_id: patientId,
    };

    // Add date range filter only if both dates are provided
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const eyeTests = await EyeTest.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    res.status(200).json({
      success: true,
      data: eyeTests,
    });
  } catch (error) {
    next(error);
  }
};

// Get eye tests by type
export const getEyeTestsByType = async (req, res, next) => {
  try {
    const { type } = req.params;

    const eyeTests = await EyeTest.findAll({
      where: {
        test_type: type,
      },
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    res.status(200).json({
      success: true,
      data: eyeTests,
    });
  } catch (error) {
    next(error);
  }
};

// Get eye tests by date
export const getEyeTestsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;

    const eyeTests = await EyeTest.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(date).setHours(0, 0, 0, 0),
          [Op.lt]: new Date(date).setHours(23, 59, 59, 999),
        },
      },
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["name", "phone"] }],
    });

    res.status(200).json({
      success: true,
      data: eyeTests,
    });
  } catch (error) {
    next(error);
  }
};
