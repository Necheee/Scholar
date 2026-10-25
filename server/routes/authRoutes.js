import express from 'express';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  deleteAccount,
  getStudentProfile,
  updateStudentProfile
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:resetToken', resetPassword);

router.get('/student-profile', protect, authorize('Student'), getStudentProfile);
router.put('/student-profile', protect, authorize('Student'), updateStudentProfile);

router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

export default router;

