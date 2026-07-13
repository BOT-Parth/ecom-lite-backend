const { z } = require('zod');

const createRequestSchema = z.object({
  name: z
    .string({ required_error: 'Store name is required' })
    .min(3, 'Store name must be at least 3 characters long')
    .max(100, 'Store name must be at most 100 characters long'),
  slug: z
    .string({ required_error: 'Store slug is required' })
    .min(3, 'Store slug must be at least 3 characters long')
    .max(50, 'Store slug must be at most 50 characters long')
    .regex(
      /^[a-z0-9-]+$/,
      'Store slug must contain only lowercase alphanumeric characters and hyphens'
    ),
});

module.exports = {
  createRequestSchema,
};
