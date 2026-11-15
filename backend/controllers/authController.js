import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'leaveease_super_secret_jwt_key_sem5_2026',
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Register a new Employee or Manager
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'employee',
      department: department || 'Engineering',
      // Default leave balances
      leaveBalance: {
        casual: 12,
        sick: 10,
        earned: 18,
      },
      totalQuota: {
        casual: 12,
        sick: 10,
        earned: 18,
      },
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          leaveBalance: user.leaveBalance,
          totalQuota: user.totalQuota,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Explicitly select password field since schema has select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          leaveBalance: user.leaveBalance,
          totalQuota: user.totalQuota,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

/**
 * @desc    Get current user profile & live leave balance
 * @route   GET /api/auth/profile
 * @access  Private (Logged-in users)
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        leaveBalance: user.leaveBalance,
        totalQuota: user.totalQuota,
      });
    } else {
      res.status(404).json({ message: 'User profile not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message || 'Server error retrieving profile' });
  }
};
