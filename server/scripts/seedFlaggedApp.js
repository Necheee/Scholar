import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { runFraudDetection } from '../services/fraudDetectionService.js';

const seedFlaggedApplication = async () => {
  try {
    console.log('--- Seeding Flagged Application for Testing ---');

    const salt = await bcrypt.genSalt(10);
    const sponsorPassword = await bcrypt.hash('SponsorPassword123!', salt);
    const studentPassword = await bcrypt.hash('StudentPassword123!', salt);
    const adminPassword = await bcrypt.hash('AdminPassword123!', salt);

    // 1. Create or Find Sponsor
    const sponsor = await prisma.user.upsert({
      where: { email: 'sponsor@scholar.edu' },
      create: {
        name: 'TechForward Foundation',
        email: 'sponsor@scholar.edu',
        password: sponsorPassword,
        role: 'Sponsor',
      },
      update: {},
    });

    // 2. Create or Find Student
    const student = await prisma.user.upsert({
      where: { email: 'david.adeleke@scholar.edu' },
      create: {
        name: 'David Adeleke',
        email: 'david.adeleke@scholar.edu',
        password: studentPassword,
        role: 'Student',
      },
      update: {},
    });

    // 3. Ensure Student Profile has official academic records matching directory
    const profile = await prisma.studentProfile.upsert({
      where: { userId: student.id },
      create: {
        userId: student.id,
        institution: 'Covenant University',
        department: 'Electrical Engineering',
        seekingSponsorship: true,
      },
      update: {
        institution: 'Covenant University',
        department: 'Electrical Engineering',
        seekingSponsorship: true,
      },
    });

    await prisma.academicRecord.deleteMany({
      where: { studentProfileId: profile.id },
    });

    await prisma.academicRecord.create({
      data: {
        studentProfileId: profile.id,
        session: '2025/2026',
        programme: 'Electrical Electronics',
        level: '400 Level',
        info: 'Regular full-time student in good standing',
      },
    });

    // Ensure Admin exists
    await prisma.user.upsert({
      where: { email: 'admin@scholar.edu' },
      create: {
        name: 'System Admin',
        email: 'admin@scholar.edu',
        password: adminPassword,
        role: 'Admin',
      },
      update: {},
    });

    // 4. Create Sponsorship Opportunity
    const sponsorship = await prisma.sponsorship.upsert({
      where: { id: 'sponsorship-stem-2026' },
      create: {
        id: 'sponsorship-stem-2026',
        sponsorId: sponsor.id,
        title: 'STEM Excellence Grant 2026',
        description: 'Annual scholarship for outstanding STEM students.',
        eligibilityRequirements: 'Undergraduate STEM students with 3.5+ CGPA',
        academicRequirements: 'Must be enrolled in an accredited university in Nigeria',
        requiredDocuments: JSON.stringify(['Transcript', 'ID Card']),
        duration: '1 Academic Session',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Active',
      },
      update: {},
    });

    // 5. Remove any existing active application for this student to bypass 1-active rule
    await prisma.application.deleteMany({
      where: { studentId: student.id },
    });

    // 6. Submit Application with deliberate discrepancy:
    console.log('Creating application with intentional academic inconsistency...');
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        sponsorshipId: sponsorship.id,
        status: 'Under screening',
        academicSession: '2025/2026',
        academicProgramme: 'Computer Science', // Mismatch against official Electrical Electronics!
        academicLevel: '300-level',            // Mismatch against official 400 Level!
        reasonForRequesting: 'I require financial assistance to complete my senior project in distributed computing.',
      },
    });

    // 7. Trigger the rule engine
    console.log('Executing runFraudDetection on application ID:', application.id);
    const evaluated = await runFraudDetection(application.id);

    console.log('\n====================================================');
    console.log(' FLAG CREATION COMPLETE!');
    console.log('====================================================');
    console.log(`• Application ID:     ${evaluated.id}`);
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
