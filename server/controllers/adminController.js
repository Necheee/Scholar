import prisma from '../config/db.js';
import { logActivity } from '../services/activityService.js';
import { formatApplication } from './applicationController.js';

// @desc    Get all activity logs
// @route   GET /api/admin/activity
// @access  Private/Admin
export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const formatted = logs.map((log) => ({
      ...log,
      _id: log.id,
      user: log.user ? { ...log.user, _id: log.user.id } : log.userId,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications waiting for info
// @route   GET /api/admin/information-requests
// @access  Private/Admin
export const getInformationRequests = async (req, res, next) => {
  try {
    const requests = await prisma.application.findMany({
      where: { status: 'Waiting for additional information' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: { select: { id: true, title: true } },
        documents: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(requests.map(formatApplication));
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Users: Get all system users (Students, Sponsors, Admins)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let whereClause = {};

    if (role && ['Student', 'Sponsor', 'Admin'].includes(role)) {
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => ({
      ...u,
      _id: u.id,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Users: Delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const currentAdminId = req.user.id || req.user._id;
    const userToDelete = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!userToDelete) {
      res.status(404);
      throw new Error('User not found');
    }

    // Safety check: Admin cannot delete their own account
    if (userToDelete.id === currentAdminId) {
      res.status(400);
      throw new Error('You cannot delete your own administrator account');
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    await logActivity(
      'Admin Deleted User',
      `Admin removed user account: ${userToDelete.name} (${userToDelete.email}) - Role: ${userToDelete.role}`,
      currentAdminId,
      'Admin'
    );

    res.json({
      message: `User ${userToDelete.name} (${userToDelete.email}) was removed successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated stats and urgent review queue for Admin Dashboard
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      flaggedPendingCount,
      totalFlaggedCount,
      totalUsersCount,
      totalApplicationsCount,
      successfulPayments,
      recentPendingApps,
    ] = await Promise.all([
      prisma.application.count({ where: { status: 'Under Admin review' } }),
      prisma.application.count({ where: { fraudReviewStatus: 'Flagged' } }),
      prisma.user.count(),
      prisma.application.count(),
      prisma.payment.findMany({
        where: { status: 'Success' },
        select: { amount: true },
      }),
      prisma.application.findMany({
        where: { status: 'Under Admin review' },
        include: {
          student: { select: { id: true, name: true, email: true } },
          sponsorship: { select: { id: true, title: true } },
          documents: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalDisbursedAmount = successfulPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    res.json({
      flaggedPending: flaggedPendingCount,
      totalFlagged: totalFlaggedCount,
      totalUsers: totalUsersCount,
      totalApplications: totalApplicationsCount,
      totalDisbursedAmount,
      recentFlagged: recentPendingApps.map(formatApplication),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Report: Aggregate statistical summary of system operations
// @route   GET /api/admin/report
// @access  Private/Admin
export const getSystemReport = async (req, res, next) => {
  try {
    const [
      totalUsers,
      studentCount,
      sponsorCount,
      adminCount,
      totalSponsorships,
      openSponsorships,
      closedSponsorships,
      totalApplications,
      approvedCount,
      disbursedCount,
      rejectedCount,
      underAdminReviewCount,
      underSponsorReviewCount,
      waitingInfoCount,
      successfulPayments,
      totalFlaggedApplications,
      highRiskFlags,
      mediumRiskFlags,
      lowRiskFlags,
      passedCleanCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'Student' } }),
      prisma.user.count({ where: { role: 'Sponsor' } }),
      prisma.user.count({ where: { role: 'Admin' } }),
      prisma.sponsorship.count(),
      prisma.sponsorship.count({ where: { status: 'Active' } }),
      prisma.sponsorship.count({ where: { status: 'Closed' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'Approved' } }),
      prisma.application.count({ where: { status: 'Grant Disbursed' } }),
      prisma.application.count({ where: { status: 'Rejected' } }),
      prisma.application.count({ where: { status: 'Under Admin review' } }),
      prisma.application.count({ where: { status: 'Under Sponsor review' } }),
      prisma.application.count({
        where: { status: 'Waiting for additional information' },
      }),
      prisma.payment.findMany({
        where: { status: 'Success' },
        select: { amount: true },
      }),
      prisma.application.count({ where: { fraudReviewStatus: 'Flagged' } }),
      prisma.fraudResult.count({ where: { overallRisk: 'High' } }),
      prisma.fraudResult.count({ where: { overallRisk: 'Medium' } }),
      prisma.fraudResult.count({ where: { overallRisk: 'Low' } }),
      prisma.application.count({ where: { fraudReviewStatus: 'Passed' } }),
    ]);

    const totalDisbursedAmount = successfulPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    res.json({
      generatedAt: new Date(),
      systemName:
        'Scholar - Secure Student Sponsorship Management System with Rule-Based Fraud Detection',
      users: {
        total: totalUsers,
        students: studentCount,
        sponsors: sponsorCount,
        admins: adminCount,
      },
      sponsorships: {
        total: totalSponsorships,
        open: openSponsorships,
        closed: closedSponsorships,
      },
      applications: {
        total: totalApplications,
        disbursed: disbursedCount,
        approved: approvedCount,
        rejected: rejectedCount,
        underAdminReview: underAdminReviewCount,
        underSponsorReview: underSponsorReviewCount,
        waitingForInfo: waitingInfoCount,
      },
      finances: {
        totalDisbursedAmount,
        currency: 'NGN (₦)',
      },
      fraudDetection: {
        totalFlagged: totalFlaggedApplications,
        cleanPassed: passedCleanCount,
        riskLevels: {
          high: highRiskFlags,
          medium: mediumRiskFlags,
          low: lowRiskFlags,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
