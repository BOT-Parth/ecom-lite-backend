/**
 * Layer:      Middleware
 * 
 * Purpose:
 * Authenticates customer requests by validating a customer JWT.
 * Enforces strict isolation: token MUST be signed with CUSTOMER_JWT_SECRET,
 * MUST contain { type: 'customer' }, and the token's storeId MUST match the 
 * storeId in the request parameters.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const authenticateCustomer = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify using the dedicated customer secret
    let decoded;
    try {
      decoded = jwt.verify(token, env.CUSTOMER_JWT_SECRET);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired customer token');
    }

    // Enforce payload boundaries
    if (decoded.type !== 'customer') {
      throw new UnauthorizedError('Invalid token type');
    }

    if (!decoded.customerId || !decoded.storeId) {
      throw new UnauthorizedError('Malformed customer token');
    }

    // Enforce tenant isolation
    const reqStoreId = req.params.storeId;
    if (reqStoreId && decoded.storeId !== reqStoreId) {
      throw new ForbiddenError('Token does not belong to this store');
    }

    req.customer = {
      id: decoded.customerId,
      storeId: decoded.storeId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticateCustomer;
