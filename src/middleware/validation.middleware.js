/**
 * Layer:      Middleware
 *
 * Purpose:
 * Factory that returns an Express middleware function for validating request
 * bodies against a given Zod schema. On failure, it passes a structured
 * BadRequestError to the next error handler. On success, it replaces req.body
 * with the parsed and coerced Zod output.
 *
 * Called By:
 * src/routes/auth.routes.js
 * src/routes/store-request.routes.js
 * src/routes/category.routes.js
 * src/routes/product.routes.js
 * src/routes/inventory.routes.js
 *
 * Calls:
 * src/utils/errors.js  (BadRequestError)
 * Zod schema passed as argument
 *
 * Request Flow:
 * Route
 *   → validation.middleware.js  (schema.safeParse)
 *   → next()  (valid) or next(BadRequestError)  (invalid)
 */

const { BadRequestError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return next(new BadRequestError('Validation failed', errorDetails));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
