import express from 'express';
import { getActivityLogs, getInformationRequests } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/activity')
  .get(protect, authorize('Admin'), getActivityLogs);

router.route('/information-requests')
  .get(protect, authorize('Admin'), getInformationRequests);

export default router;
