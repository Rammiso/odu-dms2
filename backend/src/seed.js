import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { User } from "./models/User.js";
import { Dorm } from "./models/Dorm.js";
import { Room } from "./models/Room.js";
import { ADMIN_CREDENTIALS } from "./config/constants.js";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/odu-dms");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await User.deleteMany();
    await Dorm.deleteMany();
    await Room.deleteMany();

    // insertMany bypasses pre('save') hooks, so hash manually
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 12);

    const createdUsers = await User.insertMany([
      {
        fullName: ADMIN_CREDENTIALS.fullName,
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
        role: ADMIN_CREDENTIALS.role,
        status: "Active",
      },
      {
        fullName: "Warden Jane",
        username: "warden_jane",
        email: "jane@odu.edu.et",
        password: ADMIN_CREDENTIALS.password,
        role: "Dorm Admin",
        status: "Active",
      },
      {
        fullName: "Maintenance Mark",
        username: "maint_mark",
        email: "mark@odu.edu.et",
        password: ADMIN_CREDENTIALS.password,
        role: "Maintenance Staff",
        status: "Active",
      },
      {
        fullName: "Student Sam",
        username: "sam.student",
        email: "sam@student.odu.edu.et",
        password: ADMIN_CREDENTIALS.password,
        role: "Student",
        studentId: "STU001",
        gender: "M",
        status: "Active",
      },
      {
        fullName: "Student Sally",
        username: "sally.student",
        email: "sally@student.odu.edu.et",
        password: ADMIN_CREDENTIALS.password,
        role: "Student",
        studentId: "STU002",
        gender: "F",
        status: "Active",
      },
    ]);

    console.log("✓ Users created successfully");
    console.log(`  - Admin: ${ADMIN_CREDENTIALS.username} / ${ADMIN_CREDENTIALS.password}`);
    console.log(`  - Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`  - Role: ${ADMIN_CREDENTIALS.role}`);

    const createdDorms = await Dorm.insertMany([
      {
        name: "North Hall",
        code: "NH",
        location: "North Campus",
        totalCapacity: 100,
        currentOccupancy: 0,
        status: "Active",
        floors: [1],
      },
      {
        name: "South Hall",
        code: "SH",
        location: "South Campus",
        totalCapacity: 100,
        currentOccupancy: 0,
        status: "Active",
        floors: [1],
      },
    ]);

    const roomsToInsert = [];
    for (let i = 1; i <= 5; i++) {
       roomsToInsert.push({
           dormId: createdDorms[0]._id,
           floor: 1,
           roomNumber: `N-10${i}`,
           type: "Double",
           capacity: 2,
           genderRestriction: "Male",
           status: "Available"
       });
       roomsToInsert.push({
           dormId: createdDorms[1]._id,
           floor: 1,
           roomNumber: `S-10${i}`,
           type: "Double",
           capacity: 2,
           genderRestriction: "Female",
           status: "Available"
       });
    }

    const createdRooms = await Room.insertMany(roomsToInsert);

    console.log("✓ Dorms created successfully");
    console.log("✓ Rooms created successfully");
    console.log("\n" + "=".repeat(60));
    console.log("DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📋 DEFAULT ADMIN CREDENTIALS:");
    console.log(`   Username: ${ADMIN_CREDENTIALS.username}`);
    console.log(`   Password: ${ADMIN_CREDENTIALS.password}`);
    console.log(`   Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`   Role: ${ADMIN_CREDENTIALS.role}`);
    console.log("\n📋 OTHER TEST CREDENTIALS:");
    console.log("   Dorm Admin: warden_jane / (same password)");
    console.log("   Maintenance: maint_mark / (same password)");
    console.log("   Student: sam.student / (same password)");
    console.log("\n" + "=".repeat(60) + "\n");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

connectDB().then(importData);
