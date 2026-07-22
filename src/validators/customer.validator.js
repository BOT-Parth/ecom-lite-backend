/**
 * Layer:      Validators
 * 
 * Purpose:
 * Defines validation schemas for customer requests.
 */

const { z } = require('zod');

// Customer Registration schema
const registerCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

// Customer Login schema
const loginCustomerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = {
  registerCustomerSchema,
  loginCustomerSchema,
};
