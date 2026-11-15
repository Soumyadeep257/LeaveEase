import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { calculateBusinessDays, isDateRangeOverlapping } from '../utils/leaveCalculator.js';
import { sendLeaveAppliedEmail, sendLeaveStatusEmail } from '../utils/emailService.js';

/**
 * @desc    Submit a new leave request (with overlap validation & weekend exclusion)
 * @route   POST /api/leaves/apply
 * @access  Private (Employee / Authenticated User)
 */
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide leave category, start date, end date, and reason' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be earlier than start date' });
    }

    // 1. Standout Feature: Weekend Exclusion / Sandwich Rule
    // Automatically excludes Saturdays and Sundays
    let totalDays = calculateBusinessDays(startDate, endDate);
    if (totalDays <= 0) {
      return res.status(400).json({
        message: 'Selected date range contains 0 working days (e.g. exclusively falls on a weekend).',
      });
    }

    // 2. Balance Verification
    const user = await User.findById(req.user._id);
    const currentBalance = user.leaveBalance[leaveType] ?? 0;

    if (totalDays > currentBalance) {
      return res.status(400).json({
        message: `Requested ${totalDays} day(s) exceeds your available ${leaveType} leave balance (${currentBalance} day(s) remaining).`,
      });
    }

    // 3. Standout Feature: Overlap Validation
    // Prevent applying if dates overlap with an existing Pending or Approved request
    const overlappingLeave = await Leave.findOne({
      user: req.user._id,
      status: { $in: ['Pending', 'Approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlappingLeave) {
      return res.status(400).json({
        message: `Cannot apply: These dates overlap with an existing ${overlappingLeave.status} leave request (${overlappingLeave.startDate.toISOString().split('T')[0]} to ${overlappingLeave.endDate.toISOString().split('T')[0]}).`,
      });
    }

    // Create the leave request
    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: 'Pending',
    });

    // 4. Standout Feature: Email notification to Managers
    try {
      const managers = await User.find({ role: 'manager' }).select('email');
      const managerEmails = managers.map((m) => m.email);

      await sendLeaveAppliedEmail({
        managerEmails,
        employeeName: user.name,
        department: user.department,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
      });
    } catch (emailErr) {
      console.error('Email alert trigger error:', emailErr.message);
    }

    res.status(201).json({
      message: `Leave request for ${totalDays} working day(s) submitted successfully!`,
      leave,
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: error.message || 'Server error while submitting leave' });
  }
};

/**
 * @desc    View personal leave history & status
 * @route   GET /api/leaves/my-leaves
 * @access  Private (Employee / Authenticated User)
 */
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate('reviewedBy', 'name email')
      .sort({ appliedAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: error.message || 'Server error retrieving leaves' });
  }
};

/**
 * @desc    Cancel a pending leave request
 * @route   PUT /api/leaves/:id/cancel
 * @access  Private (Owner only)
 */
export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check ownership
    if (leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only cancel your own requests' });
    }

    // Only pending requests can be cancelled
    if (leave.status !== 'Pending') {
      return res.status(400).json({
        message: `Cannot cancel a leave that is already ${leave.status}`,
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.json({ message: 'Leave request withdrawn successfully', leave });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: error.message || 'Server error while cancelling leave' });
  }
};

/**
 * @desc    View all employee leave requests (Manager only)
 * @route   GET /api/leaves/all
 * @access  Private (Manager Only)
 */
export const getAllLeaves = async (req, res) => {
  try {
    const { status, department } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = new RegExp(`^${status}$`, 'i');
    }

    const leaves = await Leave.find(query)
      .populate('user', 'name email department leaveBalance totalQuota')
      .populate('reviewedBy', 'name email')
      .sort({
        // Put 'Pending' requests first, then by applied date
        appliedAt: -1,
      });

    // Client/Department filter if specified
    let results = leaves;
    if (department && department !== 'All Departments') {
      results = leaves.filter(
        (l) => l.user && l.user.department && l.user.department.toLowerCase() === department.toLowerCase()
      );
    }

    // Map response to match frontend format cleanly
    const formatted = results.map((l) => ({
      _id: l._id,
      employeeId: l.user?._id,
      employeeName: l.user?.name || 'Unknown Employee',
      employeeEmail: l.user?.email || '',
      department: l.user?.department || 'General',
      leaveType: l.leaveType,
      startDate: l.startDate.toISOString().split('T')[0],
      endDate: l.endDate.toISOString().split('T')[0],
      totalDays: l.totalDays,
      reason: l.reason,
      status: l.status,
      managerComment: l.managerComment || '',
      reviewedBy: l.reviewedBy?.name || '',
      appliedAt: l.appliedAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: error.message || 'Server error retrieving team leaves' });
  }
};

/**
 * @desc    Approve or Reject a request & update employee balance
 * @route   PUT /api/leaves/:id/status
 * @access  Private (Manager Only)
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, managerComment } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id).populate('user');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: `This leave request is already marked as ${leave.status}` });
    }

    const employee = await User.findById(leave.user._id);
    if (!employee) {
      return res.status(404).json({ message: 'Associated employee not found' });
    }

    // Atomic Balance Deduction if Approved
    if (status === 'Approved') {
      const currentBal = employee.leaveBalance[leave.leaveType] || 0;

      if (currentBal < leave.totalDays) {
        return res.status(400).json({
          message: `Cannot approve: Employee only has ${currentBal} day(s) left in ${leave.leaveType} balance, but request is for ${leave.totalDays} day(s).`,
        });
      }

      // Deduct balance atomically
      employee.leaveBalance[leave.leaveType] = Math.max(0, currentBal - leave.totalDays);
      await employee.save();
    }

    // Update leave record
    leave.status = status;
    leave.managerComment = managerComment || '';
    leave.reviewedBy = req.user._id;
    await leave.save();

    // Standout Feature: Send status update email to employee
    try {
      await sendLeaveStatusEmail({
        employeeEmail: employee.email,
        employeeName: employee.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        totalDays: leave.totalDays,
        status,
        managerComment: leave.managerComment,
      });
    } catch (emailErr) {
      console.error('Email decision alert error:', emailErr.message);
    }

    res.json({
      message: `Leave request successfully ${status.toLowerCase()}!`,
      leave,
      updatedBalance: employee.leaveBalance,
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ message: error.message || 'Server error updating leave status' });
  }
};
