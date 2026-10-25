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
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      res.status(401);
      return next(new Error('Session expired or invalid. Please log in again.'));
    }

    try {
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        res.status(401);
        return next(new Error('User account not found'));
      }
      next();
    } catch (dbError) {
      console.error('Database query error in authMiddleware:', dbError.message);
      res.status(503);
      return next(new Error('Database service unavailable. Please check your MongoDB Atlas connection and IP whitelist.'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token provided'));
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

