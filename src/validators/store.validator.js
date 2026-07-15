/**
 * Layer:      Validators
 *
 * Purpose:
 * Defines the Zod validation schema for updating store settings.
 *
 * Called By:
 * src/routes/store.routes.js
 */

const { z } = require('zod');

const updateSettingsSchema = z.object({
  name: z
    .string({ required_error: 'Store name is required' })
    .min(3, 'Store name must be at least 3 characters long')
    .max(100, 'Store name must be at most 100 characters long'),
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
  updateSettingsSchema,
};
