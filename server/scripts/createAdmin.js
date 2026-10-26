import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';

const createAdmin = async () => {
  try {
    const adminEmail = 'admin@scholar.edu';
    const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('AdminPassword123!', salt);

    const admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
      },
    });

    console.log(`Admin user created successfully! Email: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
