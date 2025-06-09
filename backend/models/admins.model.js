import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Admin = sequelize.define(
  "admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    wallet_address: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Enable Sequelize's timestamps
  }
);

export default Admin;
