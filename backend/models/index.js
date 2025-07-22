import Admin from "./admins.model.js";
import Patient from "./patients.model.js";
import Doctor from "./doctors.model.js";
import TimeSlot from "./timeSlots.model.js";
import Appointment from "./appointments.model.js";
import Payment from "./payments.model.js";
import MedicalRecord from "./medicalRecords.model.js";
import Feedback from "./feedback.model.js";
import EyeTest from "./eyeTests.model.js";
import Notification from "./notifications.model.js";
import Medication from "./medications.model.js";
import PrescriptionItem from "./prescriptionItems.model.js";

// TimeSlot associations
Doctor.hasMany(TimeSlot, { foreignKey: "doctor_id" });
TimeSlot.belongsTo(Doctor, { foreignKey: "doctor_id" });

// Appointment associations
Patient.hasMany(Appointment, { foreignKey: "patient_id" });
Appointment.belongsTo(Patient, { foreignKey: "patient_id" });

Doctor.hasMany(Appointment, { foreignKey: "doctor_id" });
Appointment.belongsTo(Doctor, { foreignKey: "doctor_id" });

TimeSlot.hasMany(Appointment, { foreignKey: "time_slot_id" });
Appointment.belongsTo(TimeSlot, { foreignKey: "time_slot_id" });

// Payment associations
Patient.hasMany(Payment, { foreignKey: "patient_id" });
Payment.belongsTo(Patient, { foreignKey: "patient_id" });

Appointment.hasMany(Payment, { foreignKey: "appointment_id" });
Payment.belongsTo(Appointment, { foreignKey: "appointment_id" });

// Medical Record associations
Patient.hasMany(MedicalRecord, { foreignKey: "patient_id" });
MedicalRecord.belongsTo(Patient, { foreignKey: "patient_id" });

Doctor.hasMany(MedicalRecord, { foreignKey: "doctor_id" });
MedicalRecord.belongsTo(Doctor, { foreignKey: "doctor_id" });

Appointment.hasMany(MedicalRecord, { foreignKey: "appointment_id" });
MedicalRecord.belongsTo(Appointment, { foreignKey: "appointment_id" });

// Feedback associations
Patient.hasMany(Feedback, { foreignKey: "patient_id" });
Feedback.belongsTo(Patient, { foreignKey: "patient_id" });

Doctor.hasMany(Feedback, { foreignKey: "doctor_id" });
Feedback.belongsTo(Doctor, { foreignKey: "doctor_id" });

Appointment.hasMany(Feedback, { foreignKey: "appointment_id" });
Feedback.belongsTo(Appointment, { foreignKey: "appointment_id" });

// Eye Test associations
Patient.hasMany(EyeTest, { foreignKey: "patient_id" });
EyeTest.belongsTo(Patient, { foreignKey: "patient_id" });

// Notification associations
Patient.hasMany(Notification, { foreignKey: "patient_id" });
Notification.belongsTo(Patient, { foreignKey: "patient_id" });

// Medication associations
Medication.hasMany(PrescriptionItem, { foreignKey: "medication_id" });
PrescriptionItem.belongsTo(Medication, { foreignKey: "medication_id" });

// PrescriptionItem associations
PrescriptionItem.belongsTo(MedicalRecord, { foreignKey: "medical_record_id" });
MedicalRecord.hasMany(PrescriptionItem, { foreignKey: "medical_record_id" });

// Export all models
export {
  Admin,
  Patient,
  Doctor,
  TimeSlot,
  Appointment,
  Payment,
  MedicalRecord,
  Feedback,
  EyeTest,
  Notification,
  Medication,
  PrescriptionItem,
};

// export default sequelize;
