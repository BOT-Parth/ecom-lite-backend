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
