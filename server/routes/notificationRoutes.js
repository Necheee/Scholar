import express from 'express';
import { getMyNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyNotifications);

router.route('/:id/read')
  .patch(protect, markNotificationRead);

export default router;

