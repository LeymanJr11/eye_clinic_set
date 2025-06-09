import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Patient from "./patients.model.js";
import Doctor from "./doctors.model.js";
import TimeSlot from "./timeSlots.model.js";

const Appointment = sequelize.define(
  "appointment",
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
    time_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TimeSlot,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled"),
      defaultValue: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

export default Appointment;
