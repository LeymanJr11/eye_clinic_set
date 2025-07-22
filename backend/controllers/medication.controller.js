import Medication from "../models/medications.model.js";

// Create medication (admin only)
export const createMedication = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const medication = await Medication.create({ name, description });
    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
};

// Get all medications
export const getMedications = async (req, res, next) => {
  try {
    const medications = await Medication.findAll();
    res.status(200).json({ success: true, data: medications });
  } catch (error) {
    next(error);
  }
};

// Get medication by id
export const getMedicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medication = await Medication.findByPk(id);
    if (!medication) {
      return res
        .status(404)
        .json({ success: false, message: "Medication not found" });
    }
    res.status(200).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
};

// Update medication (admin only)
export const updateMedication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const medication = await Medication.findByPk(id);
    if (!medication) {
      return res
        .status(404)
        .json({ success: false, message: "Medication not found" });
    }
    await medication.update({ name, description });
    res.status(200).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
};

// Delete medication (admin only)
export const deleteMedication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medication = await Medication.findByPk(id);
    if (!medication) {
      return res
        .status(404)
        .json({ success: false, message: "Medication not found" });
    }
    await medication.destroy();
    res
      .status(200)
      .json({ success: true, message: "Medication deleted successfully" });
  } catch (error) {
    next(error);
  }
};
