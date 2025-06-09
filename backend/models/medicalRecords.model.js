import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Patient from "./patients.model.js";
import Doctor from "./doctors.model.js";
import Appointment from "./appointments.model.js";

const MedicalRecord = sequelize.define(
  "medical_record",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Patient,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Doctor,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Appointment,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    record_type: {
      type: DataTypes.ENUM(
        "diagnosis",
        "prescription",
        "test_result",
        "external_upload"
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default MedicalRecord;
