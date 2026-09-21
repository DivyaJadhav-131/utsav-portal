/**
 * Seed script — creates a default admin account.
 * Run with: npm run seed
 *
 * Default credentials:
 *   Email:    admin@college.edu
 *   Password: Admin@1234
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User';

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_events';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const adminEmail = 'admin@college.edu';
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash('Admin@1234', 12);
    await User.create({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`✅ Admin created — Email: ${adminEmail}  Password: Admin@1234`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
