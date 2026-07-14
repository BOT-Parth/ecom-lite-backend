/**
 * Layer:      Middleware
 *
 * Purpose:
 * Global Express error handler. Catches all errors passed via next(err) from
 * any middleware or controller. Maps the error's statusCode and message to a
 * standardised JSON error response.
 *
 * Called By:
 * src/app.js  (registered as the last middleware)
 *
 * Calls:
 * src/utils/response.js  (sendError)
 *
 * Request Flow:
 * Any layer that throws / calls next(err)
 *   → error.middleware.js
 *   → sendError (JSON response)
 */

const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Log error stack for debugging
  console.error('Error stack:', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  return sendError(res, message, errors, statusCode);
};

module.exports = errorHandler;
