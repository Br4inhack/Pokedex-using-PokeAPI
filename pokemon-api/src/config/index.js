// src/config/index.js
// Single source of truth for all environment-based configuration.
// Import this everywhere instead of reading process.env directly.
// This makes config changes a one-file operation.

const config = {
  env:   process.env.NODE_ENV || 'development',
  port:  parseInt(process.env.PORT) || 5000,
  isDev: process.env.NODE_ENV !== 'production',

  jwt: {
    secret:    process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  pokeapi: {
    baseUrl: process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2',
  },

  cache: {
    ttlMs: (parseInt(process.env.CACHE_TTL_MINUTES) || 10) * 60 * 1000,
  },
};

// Fail fast — if JWT_SECRET is missing in production, crash immediately
// Catching this at startup is better than getting 500s at runtime
if (!config.jwt.secret) {
  if (config.env === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is not set');
  }
  console.warn('⚠️  JWT_SECRET not set — using a weak default (dev only)');
  config.jwt.secret = 'dev-only-insecure-secret';
}

module.exports = config;
