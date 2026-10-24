import ActivityLog from '../models/ActivityLog.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Sponsorship from '../models/Sponsorship.js';
import FraudResult from '../models/FraudResult.js';
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

// @desc    Generate Report: Aggregate statistical summary of system operations
// @route   GET /api/admin/report
// @access  Private/Admin (Use Case 3.2.2.1 & Class Diagram 3.4.2 generateReport)
export const getSystemReport = async (req, res, next) => {
  try {
    // 1. User Demographics
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'Student' });
    const sponsorCount = await User.countDocuments({ role: 'Sponsor' });
    const adminCount = await User.countDocuments({ role: 'Admin' });

    // 2. Sponsorship Metrics
    const totalSponsorships = await Sponsorship.countDocuments();
    const openSponsorships = await Sponsorship.countDocuments({ status: 'Open' });
    const closedSponsorships = await Sponsorship.countDocuments({ status: 'Closed' });

    // 3. Application Pipeline
    const totalApplications = await Application.countDocuments();
    const approvedCount = await Application.countDocuments({ status: 'Approved' });
    const disbursedApps = await Application.find({ status: 'Grant Disbursed' }).populate('sponsorship', 'amount');
    const rejectedCount = await Application.countDocuments({ status: 'Rejected' });
    const underAdminReviewCount = await Application.countDocuments({ status: 'Under Admin review' });
    const underSponsorReviewCount = await Application.countDocuments({ status: 'Under Sponsor review' });
    const waitingInfoCount = await Application.countDocuments({ status: 'Waiting for additional information' });

    // 4. Financial Disbursements (Paystack)
    const totalDisbursedAmount = disbursedApps.reduce((sum, app) => sum + (app.sponsorship?.amount || 0), 0);

    // 5. Rule-Based Fraud Engine Metrics
    const totalFlaggedIncidents = await FraudResult.countDocuments();
    const highRiskFlags = await FraudResult.countDocuments({ overallRisk: 'High' });
    const mediumRiskFlags = await FraudResult.countDocuments({ overallRisk: 'Medium' });
    const lowRiskFlags = await FraudResult.countDocuments({ overallRisk: 'Low' });
    const passedCleanCount = await Application.countDocuments({ fraudReviewStatus: 'Passed' });

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
        disbursed: disbursedApps.length,
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
        totalFlagged: totalFlaggedIncidents,
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
