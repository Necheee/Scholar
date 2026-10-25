import express from 'express';
import {
  getSeekingStudents,
  createDocumentRequest,
  getMyDocumentRequests,
  submitRequestedDocuments,
  getDocumentRequestById,
} from '../controllers/documentRequestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/seeking-students', protect, authorize('Sponsor', 'Admin'), getSeekingStudents);
router.post('/', protect, authorize('Sponsor'), createDocumentRequest);
router.get('/my-requests', protect, getMyDocumentRequests);
router.put('/:id/submit', protect, authorize('Student'), submitRequestedDocuments);
router.get('/:id', protect, getDocumentRequestById);

export default router;

