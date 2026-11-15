import User from '../models/User.js';

/**
 * @desc    Get all registered users & employee quotas
 * @route   GET /api/users
 * @access  Private (Manager Only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' }).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message || 'Server error retrieving users' });
  }
};

/**
 * @desc    Adjust employee leave quota or balance (e.g. bonus leaves)
 * @route   PUT /api/users/:id/quota
 * @access  Private (Manager Only)
 */
export const updateUserQuota = async (req, res) => {
  try {
    const { casual, sick, earned } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (casual !== undefined) user.leaveBalance.casual = Number(casual);
    if (sick !== undefined) user.leaveBalance.sick = Number(sick);
    if (earned !== undefined) user.leaveBalance.earned = Number(earned);

    await user.save();

    res.json({
      message: `Leave balances updated successfully for ${user.name}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        leaveBalance: user.leaveBalance,
        totalQuota: user.totalQuota,
      },
    });
  } catch (error) {
    console.error('Update quota error:', error);
    res.status(500).json({ message: error.message || 'Server error updating leave quota' });
  }
};
