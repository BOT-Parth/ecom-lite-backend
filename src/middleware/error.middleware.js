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
