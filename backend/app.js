import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { PORT } from "./config/env.js";
import db, { connectDB } from "./database/db.js";
import syncDatabase from "./database/sync.js";
import seedDatabase from "./database/seed.js";
import routes from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";

import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: "*", // Allow all origins during development
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
// Add basic request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/test", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", routes);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to Eye Clinic Management System!");
});

const server = app.listen(PORT, async () => {
  try {
    await connectDB(); // Test the database connection
    await syncDatabase(); // Call the function to sync the database
    // await seedDatabase(); // Seed the database with initial data
    console.log(
      `Eye Clinic Management System is running on http://localhost:${PORT}`
    );
  } catch (error) {
    console.error("Failed to start the application:", error.message);
    process.exit(1); // Exit the process if the database connection fails
  }
});

export default app;
