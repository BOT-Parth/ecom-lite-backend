/**
 * Layer:      Utils
 *
 * Purpose:
 * Defines all application-level error classes extending the base AppError.
 * Each class maps to a specific HTTP status code, allowing the error handler
 * middleware to derive the response status from the thrown error type.
 *
 * Called By:
 * Any service or middleware that needs to throw a typed HTTP error.
 *
 * Calls:
 * Nothing — pure class definitions.
 *
 * Architecture note:
 * Only AppError subclasses should be thrown for expected operational errors.
 * Unexpected programming errors will fall through as unhandled 500 responses.
 */

class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors = []) {
    super(message, 400, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errors = []) {
    super(message, 401, errors);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errors = []) {
    super(message, 403, errors);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not Found', errors = []) {
    super(message, 404, errors);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict', errors = []) {
    super(message, 409, errors);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
