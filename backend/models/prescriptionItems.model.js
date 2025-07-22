import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Medication from "./medications.model.js";
import MedicalRecord from "./medicalRecords.model.js";

const PrescriptionItem = sequelize.define(
  "PrescriptionItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    medical_record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MedicalRecord,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    medication_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Medication,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "prescription_items",
    timestamps: true,
  }
);

export default PrescriptionItem;
