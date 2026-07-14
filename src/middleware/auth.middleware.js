/**
 * Layer:      Middleware
 *
 * Purpose:
 * Verifies the JWT Bearer token on every request that requires authentication.
 * Extracts the userId from the token payload and attaches req.user = { userId }
 * for downstream middleware and controllers.
 *
 * Called By:
 * Any route that requires authentication (auth.routes.js, store routes, etc.)
 *
 * Calls:
 * jsonwebtoken  (jwt.verify)
 * src/utils/errors.js  (UnauthorizedError)
 *
 * Request Flow:
 * Client request (Authorization: Bearer <token>)
 *   → auth.middleware.js  (verify JWT → attach req.user)
 *   → next middleware or controller
 */

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new UnauthorizedError('Missing or invalid Authorization header')
    );
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || !payload.userId) {
      return next(new UnauthorizedError('Invalid token payload'));
    }

    req.user = { userId: payload.userId };
    next();
  } catch (err) {
    return next(
      new UnauthorizedError('Invalid or expired authentication token')
    );
  }
};

module.exports = authenticate;
