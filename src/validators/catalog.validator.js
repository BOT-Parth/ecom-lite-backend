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
const { shortNameSchema, nameSchema, slugSchema } = require('./fields.validator');

const createCategorySchema = z.object({
  name: shortNameSchema('Category'),
  slug: slugSchema('Category'),
});

const updateCategorySchema = z.object({
  name: shortNameSchema('Category').optional(),
  slug: slugSchema('Category').optional(),
});

const createProductSchema = z.object({
  name: nameSchema('Product'),
  description: z.string().optional(),
  price: z
    .number({ required_error: 'Product price is required' })
    .positive('Product price must be a positive number'),
  imageUrls: z.array(z.string().url('Invalid image URL')).optional(),
  categoryId: z.string().uuid('Invalid category ID format').optional(),
});

const updateProductSchema = z.object({
  name: nameSchema('Product').optional(),
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
