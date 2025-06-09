import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Patient from "./patients.model.js";

const EyeTest = sequelize.define(
  "eye_test",
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
    test_type: {
      type: DataTypes.ENUM(
        "color_blindness",
        "visual_acuity",
        "contrast_sensitivity"
      ),
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default EyeTest;
