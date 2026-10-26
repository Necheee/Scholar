import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { runFraudDetection } from '../services/fraudDetectionService.js';

const showcaseStudents = [
  {
    name: 'David Adeleke',
    email: 'david.adeleke@scholar.edu',
    institution: 'Covenant University',
    programme: 'Electrical Electronics',
    department: 'Electrical Engineering',
    level: '400 Level',
    session: '2025/2026',
    gpa: '3.85',
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@scholar.edu',
    institution: 'University of Ibadan',
    programme: 'Computer Science',
    department: 'Computer Science',
    level: '300 Level',
    session: '2025/2026',
    gpa: '3.85',
  },
  {
    name: 'Chiamaka Okafor',
    email: 'chiamaka.okafor@scholar.edu',
    institution: 'University of Lagos',
    programme: 'Computer Engineering',
    department: 'Electrical & Information Engineering',
    level: '300 Level',
    session: '2025/2026',
    gpa: '3.92',
  },
  {
    name: 'Fatima Bello',
    email: 'fatima.bello@scholar.edu',
    institution: 'Ahmadu Bello University',
    programme: 'Software Engineering',
    department: 'Computer Science',
    level: '200 Level',
    session: '2025/2026',
    gpa: '3.78',
  },
  {
    name: 'Kelechi Amadi',
    email: 'kelechi.amadi@scholar.edu',
    institution: 'Federal University of Technology, Owerri',
    programme: 'Mechanical Engineering',
    department: 'Mechanical Engineering',
    level: '400 Level',
    session: '2025/2026',
    gpa: '3.65',
  },
];

const seedDatabase = async () => {
  try {
    console.log('--- Starting MySQL Database Seeding ---');

    // 1. Seed Admin
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('AdminPassword123!', salt);
    const sponsorPassword = await bcrypt.hash('SponsorPassword123!', salt);
    const studentPassword = await bcrypt.hash('StudentPassword123!', salt);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@scholar.edu' },
      create: {
        name: 'System Admin',
        email: 'admin@scholar.edu',
        password: adminPassword,
        role: 'Admin',
      },
      update: {
        password: adminPassword,
      },
    });
    console.log(`✓ Admin user: ${admin.email}`);

    // 2. Seed Sponsor
    const sponsor = await prisma.user.upsert({
      where: { email: 'sponsor@scholar.edu' },
      create: {
        name: 'TechForward Foundation',
        email: 'sponsor@scholar.edu',
        password: sponsorPassword,
        role: 'Sponsor',
      },
      update: {
        password: sponsorPassword,
      },
    });

    await prisma.sponsorProfile.upsert({
      where: { userId: sponsor.id },
      create: {
        userId: sponsor.id,
        organizationName: 'TechForward Foundation',
        description: 'Empowering future technology leaders across West Africa with merit and need-based tuition grants.',
        website: 'https://techforward.example.org',
      },
      update: {
        organizationName: 'TechForward Foundation',
      },
    });
    console.log(`✓ Sponsor user: ${sponsor.email}`);

    // 3. Seed Students
    for (const s of showcaseStudents) {
      const studentUser = await prisma.user.upsert({
        where: { email: s.email },
        create: {
          name: s.name,
          email: s.email,
          password: studentPassword,
          role: 'Student',
        },
        update: {
          password: studentPassword,
        },
      });

      const profile = await prisma.studentProfile.upsert({
        where: { userId: studentUser.id },
        create: {
          userId: studentUser.id,
          institution: s.institution,
          department: s.department,
          seekingSponsorship: true,
          bankName: 'Access Bank',
          accountNumber: '0123456789',
          accountName: s.name,
        },
        update: {
          seekingSponsorship: true,
        },
      });

      // Clear existing records and seed fresh
      await prisma.academicRecord.deleteMany({
        where: { studentProfileId: profile.id },
      });

      await prisma.academicRecord.create({
        data: {
          studentProfileId: profile.id,
          session: s.session,
          programme: s.programme,
          level: s.level,
          info: `GPA: ${s.gpa} / 4.00`,
        },
      });

      console.log(`✓ Student: ${s.name} (${s.email})`);
    }

    // 4. Seed Sponsorship Opportunity
    const sponsorship = await prisma.sponsorship.upsert({
      where: { id: 'sponsorship-stem-2026' },
      create: {
        id: 'sponsorship-stem-2026',
        sponsorId: sponsor.id,
        title: 'STEM Excellence Grant 2026',
        description: 'Annual scholarship for outstanding STEM undergraduate students demonstrating academic excellence and leadership in engineering and computing disciplines.',
        eligibilityRequirements: 'Undergraduate STEM students with 3.5+ CGPA and demonstrated commitment to technological innovation.',
        academicRequirements: 'Must be enrolled full-time in an accredited Nigerian university at 200L or above.',
        requiredDocuments: JSON.stringify(['Academic Transcript', 'Student ID Card', 'Statement of Need']),
        duration: '1 Academic Session',
        grantAmount: 250000,
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'Active',
        isLocked: true,
      },
      update: {
        sponsorId: sponsor.id,
        grantAmount: 250000,
        status: 'Active',
      },
    });
    console.log(`✓ Sponsorship: "${sponsorship.title}"`);

    // 5. Seed David Adeleke's Flagged Application (for Admin fraud review demonstration)
    const david = await prisma.user.findUnique({ where: { email: 'david.adeleke@scholar.edu' } });
    if (david) {
      await prisma.application.deleteMany({
        where: { studentId: david.id },
      });

      const flaggedApp = await prisma.application.create({
        data: {
          studentId: david.id,
          sponsorshipId: sponsorship.id,
          status: 'Under screening',
          academicSession: '2025/2026',
          academicProgramme: 'Computer Science', // Intentionally conflicts with profile's Electrical Electronics
          academicLevel: '300-level',            // Intentionally conflicts with profile's 400 Level
          reasonForRequesting: 'I require financial assistance to complete my research project in IoT sensors.',
          documents: {
            create: [
              {
                type: 'Academic Transcript',
                cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
                cloudinaryId: 'sample_transcript',
                fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              },
            ],
          },
        },
      });

      await runFraudDetection(flaggedApp.id);
      console.log(`✓ Created test Flagged Application for David Adeleke (ID: ${flaggedApp.id})`);
    }

    console.log('\n====================================================');
    console.log(' MYSQL SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Default credentials:');
    console.log('• Admin:   admin@scholar.edu           | AdminPassword123!');
    console.log('• Sponsor: sponsor@scholar.edu         | SponsorPassword123!');
    console.log('• Student: david.adeleke@scholar.edu   | StudentPassword123!');
    console.log('• Student: alex.johnson@scholar.edu    | StudentPassword123!');
    console.log('====================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error during MySQL seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
