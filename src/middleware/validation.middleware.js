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
