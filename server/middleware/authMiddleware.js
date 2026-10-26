import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// Protect routes - requires a valid JWT token
const protect = async (req, res, next) => {
  let token;

  token = req.cookies?.jwt;

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
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(401);
        return next(new Error('User account not found'));
      }
      req.user = user;
      next();
    } catch (dbError) {
      console.error('Database query error in authMiddleware:', dbError.message);
      res.status(503);
      return next(new Error('Database service unavailable. Please check your MySQL database connection.'));
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
