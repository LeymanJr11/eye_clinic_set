// This file is responsible for syncing the database with the models defined in the application.
import sequelize from "./db.js";

const syncDatabase = async () => {
  try {
    // Use the default sync behavior to create tables only if they do not exist
    await sequelize.sync(); // This will create tables if they don't exist
    console.log("Database synced successfully!");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

export default syncDatabase;
