import express from 'express';
import {
  submitApplication,
  getMyApplications,
  getFlaggedApplications,
  getApplicationById,
  adminReviewApplication,
  sponsorReviewApplication
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Student'), submitApplication);

router.route('/my-applications')
  .get(protect, authorize('Student'), getMyApplications);

router.route('/flagged')
  .get(protect, authorize('Admin'), getFlaggedApplications);

router.route('/:id')
  .get(protect, getApplicationById);

router.route('/:id/admin-review')
  .put(protect, authorize('Admin'), adminReviewApplication);

router.route('/:id/sponsor-review')
  .put(protect, authorize('Sponsor'), sponsorReviewApplication);

export default router;

