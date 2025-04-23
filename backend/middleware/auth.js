const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const User = require('../models/User');

/**
 * Authentication middleware for protecting routes
 * Verifies the token in the request header and attaches the user to the request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header (Bearer token)
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Check if it's a student or user token
    if (decoded.id) {
      // First, try to find a student
      let student = await Student.findById(decoded.id);
      
      if (student) {
        req.user = student;
        req.userType = 'student';
        return next();
      }

      // If not a student, try to find a user
      let user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        req.userType = 'user';
        return next();
      }
      
      return res.status(401).json({ message: 'User not found' });
    }
    
    return res.status(401).json({ message: 'Invalid token' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * Role-based access control middleware
 * Checks if the authenticated user has one of the required roles
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize }; 