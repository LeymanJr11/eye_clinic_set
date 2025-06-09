import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Patient from "./patients.model.js";
import Appointment from "./appointments.model.js";

const Payment = sequelize.define(
  "payment",
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
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Appointment,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },
    payment_type: {
      type: DataTypes.ENUM(
        "initial_consultation",
        "followup",
        "test",
        "prescription",
        "other"
      ),
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      defaultValue: "Initial payment",
    },
  },
  {
    timestamps: true,
  }
);

export default Payment;
