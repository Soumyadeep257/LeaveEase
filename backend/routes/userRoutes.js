import express from 'express';
import { getAllUsers, updateUserQuota } from '../controllers/userController.js';
import { protect, managerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, managerOnly, getAllUsers);
router.put('/:id/quota', protect, managerOnly, updateUserQuota);

export default router;
