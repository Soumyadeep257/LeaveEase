import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getAllLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController.js';
import { protect, managerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Employee routes
router.post('/apply', protect, applyLeave);
router.post('/', protect, applyLeave); // alias for POST /api/leaves
router.get('/my-leaves', protect, getMyLeaves);
router.put('/:id/cancel', protect, cancelLeave);

// Manager routes
router.get('/all', protect, managerOnly, getAllLeaves);
router.get('/', protect, managerOnly, getAllLeaves); // alias for GET /api/leaves
router.put('/:id/status', protect, managerOnly, updateLeaveStatus);

export default router;
