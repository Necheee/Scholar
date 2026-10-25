import ActivityLog from '../models/ActivityLog.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Sponsorship from '../models/Sponsorship.js';
import FraudResult from '../models/FraudResult.js';
import Payment from '../models/Payment.js';
import { logActivity } from '../services/activityService.js';

// @desc    Get all activity logs
// @route   GET /api/admin/activity
// @access  Private/Admin
export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100).populate('user', 'name email');
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications waiting for info
// @route   GET /api/admin/information-requests
// @access  Private/Admin
export const getInformationRequests = async (req, res, next) => {
  try {
    const requests = await Application.find({ status: 'Waiting for additional information' })
      .populate('student', 'name email')
      .populate('sponsorship', 'title')
      .sort({ updatedAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Users: Get all system users (Students, Sponsors, Admins)
// @route   GET /api/admin/users
// @access  Private/Admin (Use Case 3.2.2.1 & Class Diagram 3.4.2 manageUsers)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role && ['Student', 'Sponsor', 'Admin'].includes(role)) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Users: Delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      res.status(404);
      throw new Error('User not found');
    }

    // Safety check: Admin cannot delete their own account
    if (userToDelete._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own administrator account');
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity(
      'Admin Deleted User',
      `Admin removed user account: ${userToDelete.name} (${userToDelete.email}) - Role: ${userToDelete.role}`,
      req.user._id,
      'Admin'
    );

    res.json({ message: `User ${userToDelete.name} (${userToDelete.email}) was removed successfully` });
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
      recentPendingApps
    ] = await Promise.all([
      Application.countDocuments({ status: 'Under Admin review' }),
      Application.countDocuments({ fraudReviewStatus: 'Flagged' }),
      User.countDocuments(),
      Application.countDocuments(),
      Payment.find({ status: 'Success' }).select('amount').lean(),
      Application.find({ status: 'Under Admin review' })
        .populate('student', 'name email')
        .populate('sponsorship', 'title')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean()
    ]);

    const totalDisbursedAmount = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      flaggedPending: flaggedPendingCount,
      totalFlagged: totalFlaggedCount,
      totalUsers: totalUsersCount,
      totalApplications: totalApplicationsCount,
      totalDisbursedAmount,
      recentFlagged: recentPendingApps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Report: Aggregate statistical summary of system operations
// @route   GET /api/admin/report
// @access  Private/Admin (Use Case 3.2.2.1 & Class Diagram 3.4.2 generateReport)
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
      passedCleanCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ role: 'Sponsor' }),
      User.countDocuments({ role: 'Admin' }),
      Sponsorship.countDocuments(),
      Sponsorship.countDocuments({ status: 'Open' }),
      Sponsorship.countDocuments({ status: 'Closed' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Approved' }),
      Application.countDocuments({ status: 'Grant Disbursed' }),
      Application.countDocuments({ status: 'Rejected' }),
      Application.countDocuments({ status: 'Under Admin review' }),
      Application.countDocuments({ status: 'Under Sponsor review' }),
      Application.countDocuments({ status: 'Waiting for additional information' }),
      Payment.find({ status: 'Success' }).select('amount').lean(),
      Application.countDocuments({ fraudReviewStatus: 'Flagged' }),
      FraudResult.countDocuments({ overallRisk: 'High' }),
      FraudResult.countDocuments({ overallRisk: 'Medium' }),
      FraudResult.countDocuments({ overallRisk: 'Low' }),
      Application.countDocuments({ fraudReviewStatus: 'Passed' })
    ]);

    const totalDisbursedAmount = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      generatedAt: new Date(),
      systemName: 'Scholar - Secure Student Sponsorship Management System with Rule-Based Fraud Detection',
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
