import { Router } from 'express';
import {
    getUserProfile,
  loginUser,
  registerUser,
  verifyEmail,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
