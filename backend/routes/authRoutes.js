import express from 'express';
import {
  registerUser,
  loginUser,
  demoLogin,
  getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo', demoLogin);
router.get('/profile', protect, getUserProfile);

export default router;
