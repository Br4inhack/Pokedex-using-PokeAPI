// src/services/auth.service.js
// Handles user registration, login, and token operations
// In Phase 4 we use in-memory storage — Phase 5 connects a real database

const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const config   = require('../config');

// In-memory user store — keyed by email
// Replace with database in production
const users = new Map();

// ── Token functions ────────────────────────────────────────

function generateToken(userId) {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

// ── User functions ─────────────────────────────────────────

async function register({ email, password, username }) {
  // Check if email already registered
  if (users.has(email)) {
    const err = new Error('Email already registered');
    err.statusCode = 409; // Conflict
    throw err;
  }

  // Hash password — NEVER store plaintext passwords
  // bcrypt automatically generates a salt and applies it
  // 12 = cost factor — higher = slower = more secure
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = {
    id:        crypto.randomUUID(),
    email,
    username,
    password:  hashedPassword,   // only store the hash
    createdAt: new Date().toISOString()
  };

  users.set(email, user);

  // Return user without the password hash
  const { password: _, ...userWithoutPassword } = user;
  return {
    user:  userWithoutPassword,
    token: generateToken(user.id)
  };
}

async function login({ email, password }) {
  const user = users.get(email);

  // Use same error for "not found" and "wrong password"
  // Different messages would let attackers enumerate valid emails
  const invalidCredentialsError = new Error('Invalid email or password');
  invalidCredentialsError.statusCode = 401;

  if (!user) throw invalidCredentialsError;

  // bcrypt.compare is timing-safe — prevents timing attacks
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) throw invalidCredentialsError;

  const { password: _, ...userWithoutPassword } = user;
  return {
    user:  userWithoutPassword,
    token: generateToken(user.id)
  };
}

function getUserById(userId) {
  for (const user of users.values()) {
    if (user.id === userId) {
      const { password: _, ...safe } = user;
      return safe;
    }
  }
  return null;
}

module.exports = { register, login, verifyToken, getUserById };
