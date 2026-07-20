/**
 * Layer:      Validators
 *
 * Purpose:
 * Defines Zod validation schemas for authentication request bodies
 * (register and login). Consumed by the validation middleware.
 *
 * Called By:
 * src/routes/auth.routes.js
 *
 * Calls:
 * Nothing — pure Zod schema definitions.
 *
 * Request Flow:
 * Client request body
 *   → validation.middleware.js (applies schema)
 *   → auth.validator.js (schema definition)
 */

const { z } = require('zod');
const { emailSchema, passwordSchema } = require('./fields.validator');

const registerSchema = z.object({
  email: emailSchema,
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must be at most 50 characters long'),
  password: passwordSchema.min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(1, 'Password cannot be empty'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
