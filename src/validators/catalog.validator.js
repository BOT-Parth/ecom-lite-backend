/**
 * Layer:      Validators
 *
 * Purpose:
 * Defines Zod validation schemas for category and product request bodies.
 * These schemas are consumed by the validation middleware before any
 * controller logic runs.
 *
 * Called By:
 * src/routes/category.routes.js
 * src/routes/product.routes.js
 *
 * Calls:
 * src/constants/validation.js  (SLUG_REGEX)
 *
 * Request Flow:
 * Client request body
 *   → validation.middleware.js (applies schema)
 *   → catalog.validator.js (schema definition)
 */

const { z } = require('zod');
const { SLUG_REGEX, SLUG_REGEX_MESSAGE } = require('../constants/validation');

const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .min(3, 'Category name must be at least 3 characters long')
    .max(50, 'Category name must be at most 50 characters long'),
  slug: z
    .string({ required_error: 'Category slug is required' })
    .min(3, 'Category slug must be at least 3 characters long')
    .max(50, 'Category slug must be at most 50 characters long')
    .regex(SLUG_REGEX, `Category slug: ${SLUG_REGEX_MESSAGE}`),
});

const updateCategorySchema = z.object({
  name: z
    .string()
    .min(3, 'Category name must be at least 3 characters long')
    .max(50, 'Category name must be at most 50 characters long')
    .optional(),
  slug: z
    .string()
    .min(3, 'Category slug must be at least 3 characters long')
    .max(50, 'Category slug must be at most 50 characters long')
    .regex(SLUG_REGEX, `Category slug: ${SLUG_REGEX_MESSAGE}`)
    .optional(),
});

const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .min(3, 'Product name must be at least 3 characters long')
    .max(100, 'Product name must be at most 100 characters long'),
  description: z.string().optional(),
  price: z
    .number({ required_error: 'Product price is required' })
    .positive('Product price must be a positive number'),
  imageUrls: z.array(z.string().url('Invalid image URL')).optional(),
  categoryId: z.string().uuid('Invalid category ID format').optional(),
});

const updateProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters long')
    .max(100, 'Product name must be at most 100 characters long')
    .optional(),
  description: z.string().optional(),
  price: z.number().positive('Product price must be a positive number').optional(),
  imageUrls: z.array(z.string().url('Invalid image URL')).optional(),
  categoryId: z
    .string()
    .uuid('Invalid category ID format')
    .nullable()
    .optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
};
