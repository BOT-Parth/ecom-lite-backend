/**
 * Layer:      Utils
 *
 * Purpose:
 * Wraps async route handlers so that any thrown error or rejected promise is
 * automatically forwarded to Express's next() error handler, eliminating
 * repetitive try/catch blocks in controllers and middleware.
 *
 * Called By:
 * All controller files.
 * src/middleware/rbac.middleware.js
 *
 * Calls:
 * Nothing — generic utility wrapper.
 *
 * Usage:
 *   method = asyncHandler(async (req, res) => { ... });
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
