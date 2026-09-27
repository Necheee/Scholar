import express from 'express';
import {
  submitApplication,
  getMyApplications,
  getSponsorApplications,
  getFlaggedApplications,
  getApplicationById,
  adminReviewApplication,
  sponsorReviewApplication,
  provideAdditionalInformation,
  withdrawApplication
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Student'), submitApplication);

router.route('/my-applications')
  .get(protect, authorize('Student'), getMyApplications);

router.route('/sponsor-applications')
  .get(protect, authorize('Sponsor'), getSponsorApplications);

router.route('/flagged')
  .get(protect, authorize('Admin'), getFlaggedApplications);

router.route('/:id')
  .get(protect, getApplicationById);

router.route('/:id/admin-review')
  .put(protect, authorize('Admin'), adminReviewApplication);

router.route('/:id/sponsor-review')
  .put(protect, authorize('Sponsor'), sponsorReviewApplication);

router.route('/:id/provide-info')
  .put(protect, authorize('Student'), provideAdditionalInformation);

router.route('/:id/withdraw')
  .put(protect, authorize('Student'), withdrawApplication);

export default router;

