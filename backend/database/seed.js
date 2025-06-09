import sequelize from "./db.js";
import {
  Admin,
  Doctor,
  Patient,
  TimeSlot,
  Appointment,
  Payment,
  MedicalRecord,
  Feedback,
  EyeTest,
  Notification,
} from "../models/index.js";
import bcrypt from "bcryptjs";

const seedDatabase = async () => {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    // Seed Admin
    const admin = await Admin.findOne({
      where: { wallet_address: "0x52aF5f6a96e84D2eA8aFB4e7117562D6007A7A0c" },
    });
    if (!admin) {
      await Admin.create({
        wallet_address: "0x52aF5f6a96e84D2eA8aFB4e7117562D6007A7A0c",
        name: "First Admin",
      });
    }

    // Seed Doctors
    const doctors = await Doctor.bulkCreate([
      {
        name: "Dr. John Smith",
        email: "john.smith@eyeclinic.com",
        password: await bcrypt.hash("doctor123", 10),
        specialization: "Ophthalmologist",
        phone: "1234567890",
        address: "123 Medical Center Dr",
      },
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@eyeclinic.com",
        password: await bcrypt.hash("doctor123", 10),
        specialization: "Optometrist",
        phone: "2345678901",
        address: "456 Vision St",
      },
    ]);

    // Seed Patients
    const patients = await Patient.bulkCreate([
      {
        name: "Alice Brown",
        password: await bcrypt.hash("patient123", 10),
        phone: "3456789012",
        gender: "female",
        date_of_birth: "1990-05-15",
      },
      {
        name: "Bob Wilson",
        password: await bcrypt.hash("patient123", 10),
        phone: "4567890123",
        gender: "male",
        date_of_birth: "1985-08-22",
      },
    ]);

    // Seed TimeSlots
    const timeSlots = await TimeSlot.bulkCreate([
      {
        doctor_id: doctors[0].id,
        day_of_week: "Monday",
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      {
        doctor_id: doctors[0].id,
        day_of_week: "Wednesday",
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      {
        doctor_id: doctors[1].id,
        day_of_week: "Tuesday",
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
      {
        doctor_id: doctors[1].id,
        day_of_week: "Thursday",
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
    ]);

    // Seed Appointments
    const appointments = await Appointment.bulkCreate([
      {
        patient_id: patients[0].id,
        doctor_id: doctors[0].id,
        time_slot_id: timeSlots[0].id,
        appointment_date: "2024-03-20",
        status: "scheduled",
      },
      {
        patient_id: patients[1].id,
        doctor_id: doctors[1].id,
        time_slot_id: timeSlots[2].id,
        appointment_date: "2024-03-21",
        status: "scheduled",
      },
    ]);

    // Seed Payments
    await Payment.bulkCreate([
      {
        patient_id: patients[0].id,
        appointment_id: appointments[0].id,
        amount: 150.0,
        status: "paid",
        payment_type: "initial_consultation",
      },
      {
        patient_id: patients[1].id,
        appointment_id: appointments[1].id,
        amount: 100.0,
        status: "pending",
        payment_type: "followup",
      },
    ]);

    // Seed Medical Records
    await MedicalRecord.bulkCreate([
      {
        patient_id: patients[0].id,
        doctor_id: doctors[0].id,
        appointment_id: appointments[0].id,
        record_type: "diagnosis",
        description: "Regular eye checkup, vision is stable",
      },
      {
        patient_id: patients[1].id,
        doctor_id: doctors[1].id,
        appointment_id: appointments[1].id,
        record_type: "prescription",
        description: "Prescribed new contact lenses",
      },
    ]);

    // Seed Feedback
    await Feedback.bulkCreate([
      {
        patient_id: patients[0].id,
        doctor_id: doctors[0].id,
        rating: 5,
        appointment_id: appointments[0].id,
        comment: "Excellent service and very professional",
      },
      {
        patient_id: patients[1].id,
        doctor_id: doctors[1].id,
        rating: 4,
        appointment_id: appointments[0].id,

        comment: "Good experience overall",
      },
    ]);

    // Seed Eye Tests
    await EyeTest.bulkCreate([
      {
        patient_id: patients[0].id,
        test_type: "visual_acuity",
        result: "20/20 vision",
      },
      {
        patient_id: patients[1].id,
        test_type: "color_blindness",
        result: "Normal color vision",
      },
    ]);

    // Seed Notifications
    await Notification.bulkCreate([
      {
        patient_id: patients[0].id,
        message: "Your appointment is scheduled for tomorrow at 10:00 AM",
        type: "appointment",
        is_read: false,
      },
      {
        patient_id: patients[1].id,
        message: "Your prescription is ready for pickup",
        type: "medication",
        is_read: false,
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

export default seedDatabase;
