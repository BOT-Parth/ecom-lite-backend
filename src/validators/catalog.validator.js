const { z } = require('zod');

const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .min(3, 'Category name must be at least 3 characters long')
    .max(50, 'Category name must be at most 50 characters long'),
  slug: z
    .string({ required_error: 'Category slug is required' })
    .min(3, 'Category slug must be at least 3 characters long')
    .max(50, 'Category slug must be at most 50 characters long')
    .regex(
      /^[a-z0-9-]+$/,
      'Category slug must contain only lowercase alphanumeric characters and hyphens'
    ),
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
    .regex(
      /^[a-z0-9-]+$/,
      'Category slug must contain only lowercase alphanumeric characters and hyphens'
    )
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
