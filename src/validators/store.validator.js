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
const { nameSchema, descriptionSchema, avatarUrlSchema } = require('./fields.validator');

const updateSettingsSchema = z.object({
  name: nameSchema('Store'),
  description: descriptionSchema('Store'),
  avatarUrl: avatarUrlSchema('Store'),
});

module.exports = {
  updateSettingsSchema,
};
