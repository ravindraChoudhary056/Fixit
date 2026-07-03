const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

// Why: Only the email in ADMIN_EMAIL is the super-admin — role alone is not sufficient
const admin = (req, res, next) => {
  if (
    req.user &&
    req.user.email === process.env.ADMIN_EMAIL &&
    req.user.role === 'Admin'
  ) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
};

module.exports = { protect, admin};