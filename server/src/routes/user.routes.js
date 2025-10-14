import { Router } from 'express';
import {
  getUserProfile,
  loginUser,
  registerUser,
  verifyEmail,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, deleteAvatar);

export default router;
