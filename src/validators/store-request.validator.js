/**
 * Layer:      Validators
 *
 * Purpose:
 * Defines the Zod validation schema for store-request creation payloads.
 * Consumed by the validation middleware before controller logic runs.
 *
 * Called By:
 * src/routes/store-request.routes.js
 *
 * Calls:
 * src/constants/validation.js  (SLUG_REGEX)
 *
 * Request Flow:
 * Client request body
 *   → validation.middleware.js (applies schema)
 *   → store-request.validator.js (schema definition)
 */

const { z } = require('zod');
const { SLUG_REGEX, SLUG_REGEX_MESSAGE } = require('../constants/validation');

const createRequestSchema = z.object({
  name: z
    .string({ required_error: 'Store name is required' })
    .min(3, 'Store name must be at least 3 characters long')
    .max(100, 'Store name must be at most 100 characters long'),
  slug: z
    .string({ required_error: 'Store slug is required' })
    .min(3, 'Store slug must be at least 3 characters long')
    .max(50, 'Store slug must be at most 50 characters long')
    .regex(SLUG_REGEX, `Store slug: ${SLUG_REGEX_MESSAGE}`),
  description: z
    .string()
    .max(500, 'Store description must be at most 500 characters long')
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .max(2048, 'Store avatar reference must be at most 2048 characters long')
    .optional()
    .nullable(),
});

module.exports = {
  createRequestSchema,
};
