import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Sponsorship from '../models/Sponsorship.js';
import Application from '../models/Application.js';
import { runFraudDetection } from '../services/fraudDetectionService.js';

dotenv.config();

const seedFlaggedApplication = async () => {
  try {
    await connectDB();
    console.log('--- Seeding Flagged Application for Testing ---');

    // 1. Create or Find Sponsor
    let sponsor = await User.findOne({ email: 'sponsor@scholar.edu' });
    if (!sponsor) {
      sponsor = await User.create({
        name: 'TechForward Foundation',
        email: 'sponsor@scholar.edu',
        password: 'SponsorPassword123!',
        role: 'Sponsor',
      });
      console.log('Created test Sponsor:', sponsor.email);
    }

    // 2. Create or Find Student
    let student = await User.findOne({ email: 'david.adeleke@scholar.edu' });
    if (!student) {
      student = await User.create({
        name: 'David Adeleke',
        email: 'david.adeleke@scholar.edu',
        password: 'StudentPassword123!',
        role: 'Student',
      });
      console.log('Created test Student:', student.email);
    }

    // 3. Ensure Student Profile has official academic records matching directory (Electrical Electronics, 400-level, Covenant University)
    let profile = await StudentProfile.findOne({ user: student._id });
    const officialRecord = {
      session: '2025/2026',
      programme: 'Electrical Electronics',
      level: '400-level',
      info: 'Regular full-time student in good standing'
    };

    if (!profile) {
      profile = await StudentProfile.create({
        user: student._id,
        institution: 'Covenant University',
        department: 'Electrical Engineering',
        seekingSponsorship: true,
        academicRecords: [officialRecord]
      });
      console.log('Created verified StudentProfile (Covenant University, Electrical Electronics, 400-level)');
    } else {
      profile.institution = 'Covenant University';
      profile.department = 'Electrical Engineering';
      profile.academicRecords = [officialRecord];
      await profile.save();
      console.log('Updated verified StudentProfile to match Covenant University directory records');
    }

    // Ensure Admin exists
    let admin = await User.findOne({ email: 'admin@scholar.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@scholar.edu',
        password: 'AdminPassword123!',
        role: 'Admin',
      });
      console.log('Created Admin user: admin@scholar.edu');
    }

    // 4. Create Sponsorship Opportunity
    let sponsorship = await Sponsorship.findOne({ sponsor: sponsor._id, title: 'STEM Excellence Grant 2026' });
    if (!sponsorship) {
      sponsorship = await Sponsorship.create({
        sponsor: sponsor._id,
        title: 'STEM Excellence Grant 2026',
        description: 'Annual scholarship for outstanding STEM students.',
        eligibilityRequirements: 'Undergraduate STEM students with 3.5+ CGPA',
        academicRequirements: 'Must be enrolled in an accredited university in Nigeria',
        duration: '1 Academic Session',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Active'
      });
      console.log('Created test Sponsorship opportunity');
    }

    // 5. Remove any existing active application for this student to bypass 1-active rule
    await Application.deleteMany({ student: student._id });

    // 6. Submit Application with deliberate discrepancy:
    // Claims 'Software Engineering' and '400-level' instead of 'Computer Science' and '300-level'
    console.log('Creating application with intentional academic inconsistency...');
    const application = await Application.create({
      student: student._id,
      sponsorship: sponsorship._id,
      status: 'Under screening',
      academicInfoSnapshot: {
        session: '2025/2026',
        programme: 'Computer Science', // Mismatch against official Electrical Electronics!
        level: '300-level'             // Mismatch against official 400-level!
      },
      reasonForRequesting: 'I require financial assistance to complete my senior project in distributed computing.',
      documents: []
    });

    // 7. Trigger the rule engine
    console.log('Executing runFraudDetection on application ID:', application._id);
    const evaluated = await runFraudDetection(application._id);

    console.log('\n====================================================');
    console.log(' FLAG CREATION COMPLETE!');
    console.log('====================================================');
    console.log(`• Application ID:     ${evaluated._id}`);
    console.log(`• Fraud Review Status: ${evaluated.fraudReviewStatus}`);
    console.log(`• Application Status:  ${evaluated.status}`);
    console.log('\nYou can now open your browser and navigate to:');
    console.log('  👉 http://localhost:5173/admin/flagged');
    console.log('to inspect the flagged application in the Admin Fraud Review Queue!');
    console.log('====================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding flagged application:', err);
    process.exit(1);
  }
};

seedFlaggedApplication();

