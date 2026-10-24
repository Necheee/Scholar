import express from 'express';
import { 
  initializeDisbursement, 
  verifyDisbursement, 
  getPaymentReceipt,
  getSponsorTransactions
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initialize', protect, authorize('Sponsor'), initializeDisbursement);
router.post('/verify', protect, authorize('Sponsor'), verifyDisbursement);
router.get('/receipt/:applicationId', protect, getPaymentReceipt);
router.get('/my-transactions', protect, authorize('Sponsor'), getSponsorTransactions);

export default router;

