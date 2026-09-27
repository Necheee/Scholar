import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./server/.env') });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scholar').then(async () => {
  const Application = (await import('./server/models/Application.js')).default;
  const StudentProfile = (await import('./server/models/StudentProfile.js')).default;
  const Sponsorship = (await import('./server/models/Sponsorship.js')).default;
  
  const apps = await Application.find().sort({ createdAt: -1 }).limit(3).populate('student', 'name email').populate('sponsorship', 'title sponsor');
  console.log(JSON.stringify(apps, null, 2));
  
  const profile = await StudentProfile.findOne({ user: apps[0].student._id });
  console.log('Latest App Student Profile exists:', !!profile);

  process.exit(0);
});
