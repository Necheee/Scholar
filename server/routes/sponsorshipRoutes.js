import express from 'express';
import {
  createSponsorship,
  getSponsorships,
  getSponsorshipById,
  updateSponsorship,
} from '../controllers/sponsorshipController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSponsorships)
  .post(protect, authorize('Sponsor'), createSponsorship);

router.route('/:id')
  .get(protect, getSponsorshipById)
  .put(protect, authorize('Sponsor'), updateSponsorship);

export default router;

