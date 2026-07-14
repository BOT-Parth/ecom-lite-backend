/**
 * Layer:      Utils
 *
 * Purpose:
 * Provides standardised JSON response helper functions used by all controllers.
 * Ensures every API response follows the same envelope format:
 *   { success, message, data } or { success, message, errors }
 *
 * Called By:
 * All controller files.
 * src/middleware/error.middleware.js  (sendError)
 *
 * Calls:
 * Nothing — pure helper functions.
 */

const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message, errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
