/**
 * Layer:      Validators
 *
 * Purpose:
 * Defines the Zod validation schema for inventory update request bodies.
 * Enforces that quantity is a non-negative integer.
 *
 * Called By:
 * src/routes/inventory.routes.js
 *
 * Calls:
 * Nothing — pure Zod schema definition.
 *
 * Request Flow:
 * Client request body
 *   → validation.middleware.js (applies schema)
 *   → inventory.validator.js (schema definition)
 */

const { z } = require('zod');

const updateInventorySchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .nonnegative('Quantity cannot be negative'),
});

module.exports = {
  updateInventorySchema,
};
