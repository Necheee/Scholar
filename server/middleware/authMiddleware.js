import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - requires a valid JWT token
const protect = async (req, res, next) => {
  let token;

  token = req.cookies?.jwt; // Assuming cookie-parser will be used

  // Fallback for Bearer token if not using cookies
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

// Role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403);
      next(new Error('Not authorized for this role'));
    }
  };
};

export { protect, authorize };

