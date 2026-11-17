import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes: verifies the Bearer JWT token in Authorization header.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'null' || token === 'undefined' || !token.includes('.')) {
        return res.status(401).json({ message: 'Not authorized, invalid token structure' });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'leaveease_super_secret_jwt_key_sem5_2026'
      );

      // Attach user to request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found or token invalid' });
      }

      next();
    } catch (error) {
      console.warn('Auth token rejected:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Manager Only Middleware: restricts route to managers.
 */
export const managerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    res.status(403).json({
      message: 'Access denied: Manager role required to access this resource',
    });
  }
};
