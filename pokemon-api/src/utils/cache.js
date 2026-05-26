// src/utils/cache.js
// Thin cache abstraction over a Map.
// Services call cache.get(key) / cache.set(key, value) — they don't care
// what's underneath. In Phase 5 we swap this for a Redis client here.

const config = require('../config');

const store = new Map();

const cache = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;

    if (Date.now() - entry.cachedAt > config.cache.ttlMs) {
      store.delete(key); // lazy TTL eviction
      return null;
    }

    return entry.data;
  },

  set(key, data) {
    store.set(key, { data, cachedAt: Date.now() });
  },

  delete(key) {
    store.delete(key);
  },

  flush() {
    store.clear();
  },

  // Convenience: check size for debugging / health checks
  get size() {
    return store.size;
  },
};

module.exports = cache;
