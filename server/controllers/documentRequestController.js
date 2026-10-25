import DocumentRequest from '../models/DocumentRequest.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Application from '../models/Application.js';
import Sponsorship from '../models/Sponsorship.js';
import { createNotification } from '../services/notificationService.js';
import { logActivity } from '../services/activityService.js';

// Verified showcase profiles according to Section 10 of Vision
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

// Helper to ensure a student user exists in DB for a showcase profile
async function ensureStudentUser(showcase) {
  let user = await User.findOne({ email: showcase.email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: showcase.name,
      email: showcase.email.toLowerCase(),
      password: 'Password123!', // default seeded password
      role: 'Student',
    });
  }

  let profile = await StudentProfile.findOne({ user: user._id });
  if (!profile) {
    profile = await StudentProfile.create({
      user: user._id,
      institution: showcase.institution,
      department: showcase.department,
      seekingSponsorship: true,
      academicRecords: [
        {
          session: showcase.session,
          programme: showcase.programme,
          level: showcase.level,
          info: `GPA: ${showcase.gpa} / 4.00`,
        },
      ],
    });
  } else if (!profile.seekingSponsorship) {
    profile.seekingSponsorship = true;
    await profile.save();
  }

  return { user, profile };
}

// @desc    Get all students seeking sponsorship for Sponsor Directory
// @route   GET /api/document-requests/seeking-students
// @access  Private (Sponsors, Admins)
export const getSeekingStudents = async (req, res, next) => {
  try {
    const sponsorId = req.user._id;

    // Ensure showcase students exist in DB so any request works consistently
    for (const item of showcaseProfiles) {
      await ensureStudentUser(item);
    }

    // Query all students seeking sponsorship
    const profiles = await StudentProfile.find({ seekingSponsorship: true })
      .populate('user', 'name email role')
      .lean();

    // Query any existing document requests sent by this sponsor
    const existingRequests = await DocumentRequest.find({
      sponsor: sponsorId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedStudents = profiles
      .filter((p) => p.user && p.user.role === 'Student')
      .map((p) => {
        const matchingShowcase = showcaseProfiles.find(
          (s) => s.email.toLowerCase() === p.user.email.toLowerCase()
        );

        const latestReq = existingRequests.find(
          (r) => r.student.toString() === p.user._id.toString()
        );

        const latestRecord = p.academicRecords && p.academicRecords.length > 0
          ? p.academicRecords[p.academicRecords.length - 1]
          : null;

        return {
          id: p.user._id,
          userId: p.user._id,
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
          documentRequest: latestReq || null,
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
      studentUser = await User.findById(studentId);
    }
    if (!studentUser && studentEmail) {
      studentUser = await User.findOne({ email: studentEmail.toLowerCase() });
    }

    if (!studentUser) {
      res.status(404);
      throw new Error('Student user account not found');
    }

    // Verify sponsorship if provided
    let sponsorship = null;
    if (sponsorshipId) {
      sponsorship = await Sponsorship.findById(sponsorshipId);
    }

    // Verify application if provided
    let application = null;
    if (applicationId) {
      application = await Application.findById(applicationId);
      if (application) {
        application.status = 'Waiting for additional information';
        application.reasonForRequesting = message;
        await application.save();
      }
    }

    const docRequest = await DocumentRequest.create({
      sponsor: req.user._id,
      student: studentUser._id,
      sponsorship: sponsorship ? sponsorship._id : null,
      application: application ? application._id : null,
      requestedDocuments,
      message,
      status: 'Pending',
    });

    // Send in-app notification to the student
    const sponsorOrg = req.user.name;
    const docListStr = requestedDocuments.join(', ');
    await createNotification(
      studentUser._id,
      `Document Request from ${sponsorOrg}`,
      `${sponsorOrg} is reviewing students for scholarship opportunities and requested the following documents: ${docListStr}. Note: "${message}"`,
      application ? application._id : null,
      docRequest._id
    );

    // Log Activity
    await logActivity(
      'Document Request Sent',
      `Sponsor "${sponsorOrg}" requested verification documents (${docListStr}) from student ${studentUser.name}.`,
      req.user._id,
      'Sponsor',
      docRequest._id
    );

    const populatedRequest = await DocumentRequest.findById(docRequest._id)
      .populate('student', 'name email')
      .populate('sponsor', 'name email')
      .populate('sponsorship', 'title grantAmount');

    res.status(201).json(populatedRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's document requests (Sponsor sees sent, Student sees received)
// @route   GET /api/document-requests/my-requests
// @access  Private
export const getMyDocumentRequests = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'Sponsor') {
      query.sponsor = req.user._id;
    } else if (req.user.role === 'Student') {
      query.student = req.user._id;
    } else if (req.user.role === 'Admin') {
      query = {};
    }

    const requests = await DocumentRequest.find(query)
      .populate('sponsor', 'name email')
      .populate('student', 'name email')
      .populate('sponsorship', 'title grantAmount')
      .populate('application', 'status')
      .sort({ createdAt: -1 });

    res.json(requests);
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

    if (!submittedDocuments || !Array.isArray(submittedDocuments) || submittedDocuments.length === 0) {
      res.status(400);
      throw new Error('Please upload at least one document to submit');
    }

    const docRequest = await DocumentRequest.findById(req.params.id)
      .populate('sponsor', 'name email')
      .populate('student', 'name email')
      .populate('sponsorship', 'title');

    if (!docRequest) {
      res.status(404);
      throw new Error('Document request not found');
    }

    if (docRequest.student._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to submit documents for this request');
    }

    docRequest.submittedDocuments = submittedDocuments;
    docRequest.studentNote = studentNote || '';
    docRequest.status = 'Submitted';
    docRequest.submittedAt = new Date();
    await docRequest.save();

    // If linked to an application, update application status & attach documents
    if (docRequest.application) {
      const app = await Application.findById(docRequest.application);
      if (app) {
        const formattedDocs = submittedDocuments.map((d) => ({
          type: d.type || d.name || 'Additional Verification Document',
          cloudinaryUrl: d.cloudinaryUrl,
          cloudinaryId: d.cloudinaryId || 'doc_' + Date.now(),
          fileHash: d.fileHash,
        }));
        app.documents.push(...formattedDocs);
        app.status = 'Under Sponsor review';
        await app.save();
      }
    }

    // Notify the sponsor that student uploaded the documents
    const docNames = submittedDocuments.map((d) => d.type || d.name).join(', ');
    await createNotification(
      docRequest.sponsor._id,
      `Documents Submitted by ${req.user.name}`,
      `${req.user.name} has submitted the requested verification documents (${docNames}). Click to review the documents in the Student Directory.`,
      docRequest.application || null,
      docRequest._id
    );

    // Log Activity
    await logActivity(
      'Documents Provided by Student',
      `Student ${req.user.name} submitted requested documents (${docNames}) for sponsor ${docRequest.sponsor.name}.`,
      req.user._id,
      'Student',
      docRequest._id
    );

    res.json(docRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document request by ID
// @route   GET /api/document-requests/:id
// @access  Private
export const getDocumentRequestById = async (req, res, next) => {
  try {
    const docRequest = await DocumentRequest.findById(req.params.id)
      .populate('sponsor', 'name email')
      .populate('student', 'name email')
      .populate('sponsorship', 'title grantAmount duration');

    if (!docRequest) {
      res.status(404);
      throw new Error('Document request not found');
    }

    const isStudent = req.user._id.toString() === docRequest.student._id.toString();
    const isSponsor = req.user._id.toString() === docRequest.sponsor._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isStudent && !isSponsor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this document request');
    }

    res.json(docRequest);
  } catch (error) {
    next(error);
  }
};
