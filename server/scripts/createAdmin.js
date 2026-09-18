import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const createAdmin = async () => {
  try {
    const adminEmail = 'admin@scholar.edu'; // Change as needed
    
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit();
    }
    
    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'AdminPassword123!', // Change as needed
      role: 'Admin',
    });
    
    if (admin) {
      console.log(`Admin user created successfully! Email: ${admin.email}`);
      process.exit();
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();

