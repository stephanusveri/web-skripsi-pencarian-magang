// auth.middleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient;

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided. Please login first.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        admin: true,
        mahasiswa: true,
        perusahaan: true
      }
    });

    if (!user) {
      return res.status(401).json({
        message: 'User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token. Please login again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired. Please login again.'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized. Please authenticate first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Required role: ${roles.join(' or ')}.Your role: ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };