// src/utils/asyncHandler.js
// Wraps an async route handler to automatically catch errors
// and forward them to the Express error middleware via next()

// This is a higher-order function — it takes a function and returns a function
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
