import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import * as authCtrl from '../controllers/authController.js';
import * as sponsorCtrl from '../controllers/sponsorshipController.js';
import * as appCtrl from '../controllers/applicationController.js';
import * as docReqCtrl from '../controllers/documentRequestController.js';
import * as adminCtrl from '../controllers/adminController.js';
import * as payCtrl from '../controllers/paymentController.js';

function createMockReqRes(user = null, body = {}, params = {}, query = {}) {
  const req = {
    user,
    body,
    params,
    query,
    cookies: {},
    headers: {},
  };

  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    cookie() {},
  };

  const next = (err) => {
    if (err) throw err;
  };

  return { req, res, next };
}

async function runTests() {
  console.log('====================================================');
  console.log(' RUNNING MYSQL END-TO-END INTEGRATION TEST SUITE    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Admin Login
    console.log('[TEST 1] Testing Admin User Retrieval & Password Match');
    const admin = await prisma.user.findUnique({ where: { email: 'admin@scholar.edu' } });
    assert(admin !== null, 'Admin user exists in MySQL');
    assert(admin.role === 'Admin', 'Admin user role is Admin');
    const adminPassMatch = await bcrypt.compare('AdminPassword123!', admin.password);
    assert(adminPassMatch === true, 'Admin password verifies successfully');

    // 2. Test Sponsor Login & Profile
    console.log('\n[TEST 2] Testing Sponsor User & Profile in MySQL');
    const sponsor = await prisma.user.findUnique({
      where: { email: 'sponsor@scholar.edu' },
      include: { sponsorProfile: true },
    });
    assert(sponsor !== null, 'Sponsor exists in MySQL');
    assert(sponsor.sponsorProfile?.organizationName === 'TechForward Foundation', 'Sponsor profile organization matches');

    // 3. Test Student & Academic Records
    console.log('\n[TEST 3] Testing Student & Academic Records in MySQL');
    const student = await prisma.user.findUnique({
      where: { email: 'david.adeleke@scholar.edu' },
      include: {
        studentProfile: {
          include: { academicRecords: true },
        },
      },
    });
    assert(student !== null, 'Student exists in MySQL');
    assert(student.studentProfile?.institution === 'Covenant University', 'Student institution matches');
    assert(student.studentProfile?.academicRecords?.length > 0, 'Academic records attached in relational table');
    assert(student.studentProfile?._id !== undefined, 'Dual _id property present on student profile');

    // 4. Test Sponsorship Controller
    console.log('\n[TEST 4] Testing Sponsorship Retrieval via Controller');
    const alexUser = await prisma.user.findUnique({ where: { email: 'alex.johnson@scholar.edu' } });
    const { req: sReq, res: sRes, next: sNext } = createMockReqRes(alexUser);
    await sponsorCtrl.getSponsorships(sReq, sRes, sNext);
    assert(Array.isArray(sRes.data), 'getSponsorships returns array');
    assert(sRes.data.length > 0, 'Sponsorships list is non-empty for unapplied student');
    assert(sRes.data[0]._id !== undefined && sRes.data[0].id !== undefined, 'Dual id and _id present on sponsorship item');
    assert(Array.isArray(sRes.data[0].requiredDocuments), 'requiredDocuments parsed as array');

    // Also verify that student who applied (David) does not see it
    const { req: dReq, res: dRes, next: dNext } = createMockReqRes(student);
    await sponsorCtrl.getSponsorships(dReq, dRes, dNext);
    assert(dRes.data.length === 0, 'Already applied sponsorship is correctly filtered out for David');

    // 5. Test Sponsor Seeking Students Directory
    console.log('\n[TEST 5] Testing Sponsor Seeking Students Directory');
    const { req: dirReq, res: dirRes, next: dirNext } = createMockReqRes(sponsor);
    await docReqCtrl.getSeekingStudents(dirReq, dirRes, dirNext);
    assert(Array.isArray(dirRes.data), 'Seeking students returns array');
    assert(dirRes.data.length >= 5, 'All showcase students returned');
    assert(dirRes.data[0]._id !== undefined, 'Dual _id present on directory student card');

    // 6. Test Document Request Workflow
    console.log('\n[TEST 6] Testing Document Request Creation & Submission');
    const alex = await prisma.user.findUnique({ where: { email: 'alex.johnson@scholar.edu' } });
    const { req: reqCreate, res: resCreate, next: nextCreate } = createMockReqRes(
      sponsor,
      {
        studentId: alex.id,
        requestedDocuments: ['WAEC Certificate', 'Recommendation Letter'],
        message: 'Please provide certified copies for our scholarship evaluation.',
      }
    );
    await docReqCtrl.createDocumentRequest(reqCreate, resCreate, nextCreate);
    const createdReq = resCreate.data;
    assert(createdReq !== null && createdReq.id !== undefined, 'Document request created in MySQL');
    assert(createdReq._id !== undefined, 'Document request has dual _id');
    assert(createdReq.status === 'Pending', 'Initial status is Pending');

    // Student submits documents
    const { req: subReq, res: subRes, next: subNext } = createMockReqRes(
      alex,
      {
        submittedDocuments: [
          {
            name: 'WAEC Certificate',
            type: 'WAEC Certificate',
            cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/sample_waec.pdf',
            cloudinaryId: 'waec_123',
            fileHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
          },
        ],
        studentNote: 'Attached is my WAEC certification.',
      },
      { id: createdReq.id }
    );
    await docReqCtrl.submitRequestedDocuments(subReq, subRes, subNext);
    assert(subRes.data.status === 'Submitted', 'Document request status transitioned to Submitted');
    assert(subRes.data.submittedDocuments?.length === 1, 'Submitted document stored in relational table');

    // 7. Test Admin Flagged Queue & Dashboard Stats
    console.log('\n[TEST 7] Testing Admin Review Queue & Dashboard Stats');
    const { req: adminReq, res: adminRes, next: adminNext } = createMockReqRes(admin);
    await appCtrl.getFlaggedApplications(adminReq, adminRes, adminNext);
    assert(Array.isArray(adminRes.data), 'Flagged applications returns array');
    assert(adminRes.data.length > 0, 'Flagged applications present in review queue');
    assert(adminRes.data[0].fraudResult !== null, 'Fraud result details attached');
    assert(adminRes.data[0]._id !== undefined, 'Application has dual _id');

    const { req: statsReq, res: statsRes, next: statsNext } = createMockReqRes(admin);
    await adminCtrl.getAdminDashboardStats(statsReq, statsRes, statsNext);
    assert(statsRes.data.totalUsers >= 7, 'Total users accurately counted in MySQL');
    assert(statsRes.data.flaggedPending >= 1, 'Flagged pending count accurately counted');

    // 8. Test System Report Aggregation
    console.log('\n[TEST 8] Testing System Report Generation');
    const { req: repReq, res: repRes, next: repNext } = createMockReqRes(admin);
    await adminCtrl.getSystemReport(repReq, repRes, repNext);
    assert(repRes.data.users.total >= 7, 'Report user total is accurate');
    assert(repRes.data.fraudDetection.riskLevels !== undefined, 'Report includes risk level statistics');

    console.log('\n====================================================');
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

runTests();
