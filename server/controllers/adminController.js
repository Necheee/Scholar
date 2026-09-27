import ActivityLog from '../models/ActivityLog.js';
import Application from '../models/Application.js';

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
