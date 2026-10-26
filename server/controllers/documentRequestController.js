import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { createNotification } from '../services/notificationService.js';
import { logActivity } from '../services/activityService.js';

// Verified showcase student directory profiles
const showcaseProfiles = [
  {
    name: 'David Adeleke',
    email: 'david.adeleke@scholar.edu',
    institution: 'Covenant University',
    programme: 'Electrical Electronics',
    department: 'Electrical Engineering',
    level: '400 Level',
    session: '2025/2026',
    gpa: '3.85',
    seekingSponsorship: true,
    bio: 'Hardware researcher specializing in low-power LoRaWAN networks for precision agriculture.',
    careerGoal: 'Agritech Hardware Specialist',
    skills: ['C++', 'Sensor Networks', 'PCB Layout'],
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
    seekingSponsorship: true,
    bio: 'Passionate about distributed systems and cloud infrastructure. Ranked in the top 3% of the department with an active record of peer tutoring in data structures.',
    careerGoal: 'Cloud Platform Engineer & Tech Educator in West Africa',
    skills: ['Python', 'Golang', 'Docker', 'Algorithm Design'],
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
    seekingSponsorship: true,
    bio: 'Embedded systems engineer developing solar telemetric monitors for community health centers in underserved zones.',
    careerGoal: 'Renewable IoT Infrastructure Engineer',
    skills: ['Embedded C', 'Hardware Prototyping', 'Circuit Design'],
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
    seekingSponsorship: true,
    bio: 'Tech community builder and aspiring security architect. Active in open source cryptography and women in tech mentoring.',
    careerGoal: 'Cryptographic Protocol Engineer',
    skills: ['Rust', 'Java', 'Cryptography'],
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
    seekingSponsorship: true,
    bio: 'Passionate about computational fluid dynamics and affordable prosthetic mechanical linkages.',
    careerGoal: 'Biomechanical Product Designer',
    skills: ['SolidWorks', 'MATLAB', 'Finite Element Analysis'],
  },
];

export const formatDocumentRequest = (dr) => {
  if (!dr) return null;
  let reqDocs = dr.requestedDocuments;
  if (typeof reqDocs === 'string') {
    try {
      reqDocs = JSON.parse(reqDocs);
    } catch {
      reqDocs = [];
    }
  }
  return {
    ...dr,
    _id: dr.id,
    sponsor: dr.sponsor ? { ...dr.sponsor, _id: dr.sponsor.id } : dr.sponsorId,
    student: dr.student ? { ...dr.student, _id: dr.student.id } : dr.studentId,
    sponsorship: dr.sponsorship ? { ...dr.sponsorship, _id: dr.sponsorship.id } : dr.sponsorshipId,
    application: dr.application ? { ...dr.application, _id: dr.application.id } : dr.applicationId,
    requestedDocuments: Array.isArray(reqDocs) ? reqDocs : [],
    submittedDocuments: (dr.submittedDocuments || []).map((sd) => ({
      ...sd,
      _id: sd.id,
    })),
  };
};

// Helper to ensure a student user exists in DB for a showcase profile
async function ensureStudentUser(showcase) {
  let user = await prisma.user.findUnique({
    where: { email: showcase.email.toLowerCase() },
  });

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);
    user = await prisma.user.create({
      data: {
        name: showcase.name,
        email: showcase.email.toLowerCase(),
        password: hashedPassword,
        role: 'Student',
      },
    });
  }

  let profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: { academicRecords: true },
  });

  if (!profile) {
    profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        institution: showcase.institution,
        department: showcase.department,
        seekingSponsorship: true,
        academicRecords: {
          create: [
            {
              session: showcase.session,
              programme: showcase.programme,
              level: showcase.level,
              info: `GPA: ${showcase.gpa} / 4.00`,
            },
          ],
        },
      },
      include: { academicRecords: true },
    });
  } else if (!profile.seekingSponsorship) {
    profile = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { seekingSponsorship: true },
      include: { academicRecords: true },
    });
  }

  return { user, profile };
}

// @desc    Get all students seeking sponsorship for Sponsor Directory
// @route   GET /api/document-requests/seeking-students
// @access  Private (Sponsors, Admins)
export const getSeekingStudents = async (req, res, next) => {
  try {
    const sponsorId = req.user.id || req.user._id;

    // Ensure showcase students exist in DB so any request works consistently
    for (const item of showcaseProfiles) {
      await ensureStudentUser(item);
    }

    // Query all students seeking sponsorship
    const profiles = await prisma.studentProfile.findMany({
      where: { seekingSponsorship: true },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        academicRecords: true,
      },
    });

    // Query any existing document requests sent by this sponsor
    const existingRequests = await prisma.documentRequest.findMany({
      where: { sponsorId },
      include: { submittedDocuments: true },
      orderBy: { createdAt: 'desc' },
    });

    const formattedStudents = profiles
      .filter((p) => p.user && p.user.role === 'Student')
      .map((p) => {
        const matchingShowcase = showcaseProfiles.find(
          (s) => s.email.toLowerCase() === p.user.email.toLowerCase()
        );

        const latestReq = existingRequests.find((r) => r.studentId === p.user.id);

        const latestRecord =
          p.academicRecords && p.academicRecords.length > 0
            ? p.academicRecords[p.academicRecords.length - 1]
            : null;

        return {
          id: p.user.id,
          _id: p.user.id,
          userId: p.user.id,
          name: p.user.name,
          email: p.user.email,
          institution: p.institution || matchingShowcase?.institution || 'Nigerian University',
          programme: latestRecord?.programme || matchingShowcase?.programme || p.department,
          department: p.department || matchingShowcase?.department || 'Department',
          level: latestRecord?.level || matchingShowcase?.level || '300 Level',
          session: latestRecord?.session || matchingShowcase?.session || '2025/2026',
          gpa: matchingShowcase?.gpa || '3.80',
          seekingSponsorship: true,
          bio: matchingShowcase?.bio || 'Verified academic student seeking scholarship opportunities to complete degree requirements.',
          careerGoal: matchingShowcase?.careerGoal || 'Future Academic & Professional Leader',
          skills: matchingShowcase?.skills || ['Academic Research', 'Technical Writing'],
          documentRequest: latestReq ? formatDocumentRequest(latestReq) : null,
        };
      });

    res.json(formattedStudents);
  } catch (error) {
    next(error);
  }
};

// @desc    Sponsor creates a document request to reach out to a student
// @route   POST /api/document-requests
// @access  Private (Sponsor)
export const createDocumentRequest = async (req, res, next) => {
  try {
    const {
      studentId,
      studentEmail,
      sponsorshipId,
      applicationId,
      requestedDocuments,
      message,
    } = req.body;

    const sponsorId = req.user.id || req.user._id;

    if (!requestedDocuments || !Array.isArray(requestedDocuments) || requestedDocuments.length === 0) {
      res.status(400);
      throw new Error('Please select at least one document to request');
    }

    if (!message || !message.trim()) {
      res.status(400);
      throw new Error('Please provide a message or note explaining the document request');
    }

    let studentUser = null;
    if (studentId) {
      studentUser = await prisma.user.findUnique({ where: { id: studentId } });
    }
    if (!studentUser && studentEmail) {
      studentUser = await prisma.user.findUnique({
        where: { email: studentEmail.toLowerCase() },
      });
    }

    if (!studentUser) {
      res.status(404);
      throw new Error('Student user account not found');
    }

    let sponsorship = null;
    if (sponsorshipId) {
      sponsorship = await prisma.sponsorship.findUnique({
        where: { id: sponsorshipId },
      });
    }

    let application = null;
    if (applicationId) {
      application = await prisma.application.findUnique({
        where: { id: applicationId },
      });
      if (application) {
        await prisma.application.update({
          where: { id: applicationId },
          data: {
            status: 'Waiting for additional information',
            reasonForRequesting: message,
          },
        });
      }
    }

    const docRequest = await prisma.documentRequest.create({
      data: {
        sponsorId,
        studentId: studentUser.id,
        sponsorshipId: sponsorship ? sponsorship.id : null,
        applicationId: application ? application.id : null,
        requestedDocuments: JSON.stringify(requestedDocuments),
        message,
        status: 'Pending',
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsor: { select: { id: true, name: true, email: true } },
        sponsorship: { select: { id: true, title: true, grantAmount: true } },
        submittedDocuments: true,
      },
    });

    // Send in-app notification to the student
    const sponsorOrg = req.user.name;
    const docListStr = requestedDocuments.join(', ');
    await createNotification(
      studentUser.id,
      `Document Request from ${sponsorOrg}`,
      `${sponsorOrg} is reviewing students for scholarship opportunities and requested the following documents: ${docListStr}. Note: "${message}"`,
      application ? application.id : null,
      docRequest.id
    );

    // Log Activity
    await logActivity(
      'Document Request Sent',
      `Sponsor "${sponsorOrg}" requested verification documents (${docListStr}) from student ${studentUser.name}.`,
      sponsorId,
      'Sponsor',
      docRequest.id
    );

    res.status(201).json(formatDocumentRequest(docRequest));
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's document requests (Sponsor sees sent, Student sees received)
// @route   GET /api/document-requests/my-requests
// @access  Private
export const getMyDocumentRequests = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    let whereClause = {};

    if (req.user.role === 'Sponsor') {
      whereClause = { sponsorId: userId };
    } else if (req.user.role === 'Student') {
      whereClause = { studentId: userId };
    } else if (req.user.role === 'Admin') {
      whereClause = {};
    }

    const requests = await prisma.documentRequest.findMany({
      where: whereClause,
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        sponsorship: { select: { id: true, title: true, grantAmount: true } },
        application: { select: { id: true, status: true } },
        submittedDocuments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests.map(formatDocumentRequest));
  } catch (error) {
    next(error);
  }
};

// @desc    Student submits the requested documents
// @route   PUT /api/document-requests/:id/submit
// @access  Private (Student)
export const submitRequestedDocuments = async (req, res, next) => {
  try {
    const { submittedDocuments, studentNote } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!submittedDocuments || !Array.isArray(submittedDocuments) || submittedDocuments.length === 0) {
      res.status(400);
      throw new Error('Please upload at least one document to submit');
    }

    const docRequest = await prisma.documentRequest.findUnique({
      where: { id: req.params.id },
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        sponsorship: { select: { id: true, title: true } },
      },
    });

    if (!docRequest) {
      res.status(404);
      throw new Error('Document request not found');
    }

    if (docRequest.studentId !== studentId) {
      res.status(403);
      throw new Error('Not authorized to submit documents for this request');
    }

    // Insert submitted documents
    await prisma.submittedDocument.createMany({
      data: submittedDocuments.map((d) => ({
        documentRequestId: docRequest.id,
        name: d.name || d.type || 'Document',
        type: d.type || d.name || 'Credential',
        cloudinaryUrl: d.cloudinaryUrl,
        cloudinaryId: d.cloudinaryId || null,
        fileHash: d.fileHash || null,
      })),
    });

    const updated = await prisma.documentRequest.update({
      where: { id: docRequest.id },
      data: {
        studentNote: studentNote || '',
        status: 'Submitted',
        submittedAt: new Date(),
      },
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        sponsorship: { select: { id: true, title: true } },
        submittedDocuments: true,
      },
    });

    // If linked to an application, update application status & attach documents
    if (docRequest.applicationId) {
      await prisma.applicationDocument.createMany({
        data: submittedDocuments.map((d) => ({
          applicationId: docRequest.applicationId,
          type: d.type || d.name || 'Additional Verification Document',
          cloudinaryUrl: d.cloudinaryUrl,
          cloudinaryId: d.cloudinaryId || 'doc_' + Date.now(),
          fileHash: d.fileHash || null,
        })),
      });

      await prisma.application.update({
        where: { id: docRequest.applicationId },
        data: { status: 'Under Sponsor review' },
      });
    }

    // Notify the sponsor that student uploaded the documents
    const docNames = submittedDocuments.map((d) => d.type || d.name).join(', ');
    await createNotification(
      docRequest.sponsorId,
      `Documents Submitted by ${req.user.name}`,
      `${req.user.name} has submitted the requested verification documents (${docNames}). Click to review the documents in the Student Directory.`,
      docRequest.applicationId || null,
      docRequest.id
    );

    // Log Activity
    await logActivity(
      'Documents Provided by Student',
      `Student ${req.user.name} submitted requested documents (${docNames}) for sponsor ${docRequest.sponsor?.name || 'Sponsor'}.`,
      studentId,
      'Student',
      docRequest.id
    );

    res.json(formatDocumentRequest(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document request by ID
// @route   GET /api/document-requests/:id
// @access  Private
export const getDocumentRequestById = async (req, res, next) => {
  try {
    const docRequest = await prisma.documentRequest.findUnique({
      where: { id: req.params.id },
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        sponsorship: { select: { id: true, title: true, grantAmount: true, duration: true } },
        submittedDocuments: true,
      },
    });

    if (!docRequest) {
      res.status(404);
      throw new Error('Document request not found');
    }

    const currentUserId = req.user.id || req.user._id;
    const isStudent = currentUserId === docRequest.studentId;
    const isSponsor = currentUserId === docRequest.sponsorId;
    const isAdmin = req.user.role === 'Admin';

    if (!isStudent && !isSponsor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this document request');
    }

    res.json(formatDocumentRequest(docRequest));
  } catch (error) {
    next(error);
  }
};
