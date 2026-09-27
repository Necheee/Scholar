import express from 'express';
import { loginUser, registerUser, logoutUser, forgotPassword, resetPassword, changePassword, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:resetToken', resetPassword);

router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

export default router;

