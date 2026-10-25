import express from 'express';
import { 
  getActivityLogs, 
  getInformationRequests, 
  getUsers, 
  deleteUser, 
  getSystemReport,
  getAdminDashboardStats
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/dashboard-stats')
  .get(protect, authorize('Admin'), getAdminDashboardStats);

router.route('/activity')
  .get(protect, authorize('Admin'), getActivityLogs);

router.route('/information-requests')
  .get(protect, authorize('Admin'), getInformationRequests);

router.route('/users')
  .get(protect, authorize('Admin'), getUsers);

router.route('/users/:id')
  .delete(protect, authorize('Admin'), deleteUser);

router.route('/report')
  .get(protect, authorize('Admin'), getSystemReport);

export default router;
