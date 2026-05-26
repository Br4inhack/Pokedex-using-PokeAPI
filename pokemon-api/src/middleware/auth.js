// src/middleware/auth.js
// Protects routes — extracts and verifies JWT from Authorization header
// Attaches the decoded user payload to req.user

const { verifyToken } = require('../services/auth.service');

function requireAuth(req, res, next) {
  // Standard format: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required. Provide a Bearer token.' }
    });
  }

  // Extract the token part
  const token = authHeader.split(' ')[1];

  try {
    // verifyToken throws if token is invalid or expired
    const decoded = verifyToken(token);

    // Attach user info to the request object
    // Available to all subsequent middleware and the controller
    req.user = decoded;
    next();

  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'Token has expired. Please log in again.'
      : 'Invalid token. Please log in again.';

    return res.status(401).json({
      success: false,
      error: { message }
    });
  }
}

module.exports = { requireAuth };
