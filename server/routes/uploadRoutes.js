import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadDocument, deleteDocument } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.single('document'), uploadDocument);

router.route('/:id')
  .delete(protect, deleteDocument);

export default router;

