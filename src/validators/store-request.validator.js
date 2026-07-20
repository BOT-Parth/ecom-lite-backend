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
const { nameSchema, slugSchema, descriptionSchema, avatarUrlSchema } = require('./fields.validator');

const createRequestSchema = z.object({
  name: nameSchema('Store'),
  slug: slugSchema('Store'),
  description: descriptionSchema('Store'),
  avatarUrl: avatarUrlSchema('Store'),
});

module.exports = {
  createRequestSchema,
};
