import MedicalRecord from "../models/medicalRecords.model.js";
import Patient from "../models/patients.model.js";
import Doctor from "../models/doctors.model.js";
import Appointment from "../models/appointments.model.js";
import Notification from "../models/notifications.model.js";
import PrescriptionItem from "../models/prescriptionItems.model.js";
import Medication from "../models/medications.model.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs/promises";

// Create medical record
export const createMedicalRecord = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_id, record_type, description } =
      req.body;

    // If doctor is creating, use their ID from token
    // If admin is creating, use the provided doctor_id
    const final_doctor_id =
      req.user.role === "doctor" ? req.user.id : doctor_id;

    // Validate appointment exists and belongs to the doctor
    const appointment = await Appointment.findOne({
      where: {
        id: appointment_id,
        doctor_id: final_doctor_id,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to create record",
      });
    }

    let file_url = null;
    if (req.file) {
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `record_${Date.now()}${fileExtension}`;
      const filePath = path.join("uploads", fileName);

      // Move file to uploads directory
      await fs.rename(req.file.path, filePath);
      file_url = fileName;
    }

    const medicalRecord = await MedicalRecord.create({
      patient_id,
      doctor_id: final_doctor_id,
      appointment_id,
      record_type,
      description,
      file_url,
    });

    // Create notification for the patient
    try {
      // Find the doctor's name by their id from doctors.model.js
      let doctorName = "your doctor";
      try {
        const doctor = await Doctor.findByPk(final_doctor_id, {
          attributes: ["name"],
        });
        if (doctor && doctor.name) {
          doctorName = doctor.name;
        }
      } catch (doctorLookupError) {
        console.error("Error fetching doctor name:", doctorLookupError);
      }

      await Notification.create({
        patient_id,
        message: `New ${record_type} record has been added by Dr. ${doctorName}. Check your medical records for details.`,
        type: "medication",
        is_read: false,
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the main operation if notification fails
    }

    // If record_type === 'prescription' and req.body.prescription_items is an array, bulk create prescription items
    let prescriptionItems = req.body.prescription_items;
    if (typeof prescriptionItems === "string") {
      try {
        prescriptionItems = JSON.parse(prescriptionItems);
      } catch (e) {
        prescriptionItems = [];
      }
    }
    if (
      record_type === "prescription" &&
      prescriptionItems &&
      Array.isArray(prescriptionItems)
    ) {
      await Promise.all(
        prescriptionItems.map(async (item) => {
          const medication = await Medication.findByPk(item.medication_id);
          if (medication) {
            await PrescriptionItem.create({
              medical_record_id: medicalRecord.id,
              medication_id: item.medication_id,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions,
            });
          }
        })
      );
    }

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      data: medicalRecord,
    });
  } catch (error) {
    // If file was uploaded but record creation failed, delete the file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    next(error);
  }
};

// Get all medical records (admin only)
export const getMedicalRecords = async (req, res, next) => {
  try {
    const medicalRecords = await MedicalRecord.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: Appointment, attributes: ["appointment_date"] },
        {
          model: PrescriptionItem,
          include: [{ model: Medication, attributes: ["name"] }],
          attributes: [
            "id",
            "medication_id",
            "dosage",
            "frequency",
            "duration",
            "instructions",
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
};

// Get medical record by ID
export const getMedicalRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medicalRecord = await MedicalRecord.findByPk(id, {
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: Appointment, attributes: ["appointment_date"] },
      ],
    });

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Check if user has permission to view this record
    if (req.user.role === "doctor" && medicalRecord.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this record",
      });
    }

    if (
      req.user.role === "patient" &&
      medicalRecord.patient_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this record",
      });
    }

    // If record_type === 'prescription', include prescription_items (with medication details) in the response
    if (medicalRecord.record_type === "prescription") {
      await medicalRecord.reload({
        include: [
          {
            model: PrescriptionItem,
            include: [
              {
                model: Medication,
                attributes: ["name", "dosage_form", "strength"],
              },
            ],
            attributes: [
              "id",
              "medication_id",
              "dosage",
              "frequency",
              "duration",
              "instructions",
            ],
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      data: medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};

// Update medical record
export const updateMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { record_type, description } = req.body;

    const medicalRecord = await MedicalRecord.findByPk(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Check if user has permission to update this record
    if (req.user.role === "doctor" && medicalRecord.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this record",
      });
    }

    let file_url = medicalRecord.file_url;
    if (req.file) {
      // Delete old file if exists
      if (medicalRecord.file_url) {
        try {
          await fs.unlink(path.join("uploads", medicalRecord.file_url));
        } catch (unlinkError) {
          console.error("Error deleting old file:", unlinkError);
        }
      }

      const fileExtension = path.extname(req.file.originalname);
      const fileName = `record_${Date.now()}${fileExtension}`;
      const filePath = path.join("uploads", fileName);

      // Move new file to uploads directory
      await fs.rename(req.file.path, filePath);
      file_url = fileName;
    }

    await medicalRecord.update({
      record_type,
      description,
      file_url,
    });

    // If record_type === 'prescription' and req.body.prescription_items is an array, delete old items and bulk create new ones
    let prescriptionItems = req.body.prescription_items;
    if (typeof prescriptionItems === "string") {
      try {
        prescriptionItems = JSON.parse(prescriptionItems);
      } catch (e) {
        prescriptionItems = [];
      }
    }
    if (
      record_type === "prescription" &&
      prescriptionItems &&
      Array.isArray(prescriptionItems)
    ) {
      await PrescriptionItem.destroy({ where: { medical_record_id: id } });
      await Promise.all(
        prescriptionItems.map(async (item) => {
          const medication = await Medication.findByPk(item.medication_id);
          if (medication) {
            await PrescriptionItem.create({
              medical_record_id: id,
              medication_id: item.medication_id,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions,
            });
          }
        })
      );
    }

    res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      data: medicalRecord,
    });
  } catch (error) {
    // If file was uploaded but update failed, delete the file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    next(error);
  }
};

// Delete medical record
export const deleteMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medicalRecord = await MedicalRecord.findByPk(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Check permissions
    if (req.user.role === "doctor" && medicalRecord.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this record",
      });
    }

    // Delete associated file if exists
    if (medicalRecord.file_url) {
      try {
        await fs.unlink(path.join("uploads", medicalRecord.file_url));
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    await medicalRecord.destroy();

    res.status(200).json({
      success: true,
      message: "Medical record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get medical records by patient
export const getMedicalRecordsByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.user.id;

    // Check if user has permission to view these records
    if (req.user.role === "patient" && patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view these records",
      });
    }

    const medicalRecords = await MedicalRecord.findAll({
      where: {
        patient_id: patientId,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: Appointment, attributes: ["appointment_date"] },
        {
          model: PrescriptionItem,
          include: [{ model: Medication, attributes: ["name"] }],
          attributes: [
            "id",
            "medication_id",
            "dosage",
            "frequency",
            "duration",
            "instructions",
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
};

// Get medical records by doctor
export const getMedicalRecordsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId || req.user.id;

    // Check if user has permission to view these records
    if (req.user.role === "doctor" && doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view these records",
      });
    }

    const medicalRecords = await MedicalRecord.findAll({
      where: {
        doctor_id: doctorId,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Appointment, attributes: ["appointment_date"] },
        {
          model: PrescriptionItem,
          include: [{ model: Medication, attributes: ["name"] }],
          attributes: [
            "id",
            "medication_id",
            "dosage",
            "frequency",
            "duration",
            "instructions",
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
};

// Get medical records by appointment
export const getMedicalRecordsByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    // Check if appointment exists and user has permission
    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        ...(req.user.role === "patient" ? { patient_id: req.user.id } : {}),
        ...(req.user.role === "doctor" ? { doctor_id: req.user.id } : {}),
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to view records",
      });
    }

    const medicalRecords = await MedicalRecord.findAll({
      where: {
        appointment_id: appointmentId,
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        {
          model: PrescriptionItem,
          include: [{ model: Medication, attributes: ["name"] }],
          attributes: [
            "id",
            "medication_id",
            "dosage",
            "frequency",
            "duration",
            "instructions",
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
};

// Get medical records by date (admin only)
export const getMedicalRecordsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;

    const medicalRecords = await MedicalRecord.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(date).setHours(0, 0, 0, 0),
          [Op.lt]: new Date(date).setHours(23, 59, 59, 999),
        },
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["name", "phone"] },
        { model: Doctor, attributes: ["name", "specialization"] },
        { model: Appointment, attributes: ["appointment_date"] },
        {
          model: PrescriptionItem,
          include: [{ model: Medication, attributes: ["name"] }],
          attributes: [
            "id",
            "medication_id",
            "dosage",
            "frequency",
            "duration",
            "instructions",
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
};
