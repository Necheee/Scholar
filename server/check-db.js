import prisma from './config/db.js';

async function check() {
  const apps = await prisma.application.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { id: true, name: true, email: true } },
      sponsorship: { select: { id: true, title: true, sponsorId: true } },
    },
  });

  console.log('Latest Applications in MySQL:', JSON.stringify(apps, null, 2));

  if (apps.length > 0) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: apps[0].studentId },
    });
    console.log('Latest App Student Profile exists in MySQL:', !!profile);
  }

  process.exit(0);
}

check().catch((e) => {
  console.error(e);
  process.exit(1);
});
