const { z } = require('zod');
const { SLUG_REGEX, SLUG_REGEX_MESSAGE } = require('../constants/validation');

const emailSchema = z
  .string({ required_error: 'Email is required' })
  .email('Invalid email address');

const passwordSchema = z
  .string({ required_error: 'Password is required' });

const nameSchema = (entity) => z
  .string({ required_error: `${entity} name is required` })
  .min(3, `${entity} name must be at least 3 characters long`)
  .max(100, `${entity} name must be at most 100 characters long`);

const shortNameSchema = (entity) => z
  .string({ required_error: `${entity} name is required` })
  .min(3, `${entity} name must be at least 3 characters long`)
  .max(50, `${entity} name must be at most 50 characters long`);

const slugSchema = (entity) => z
  .string({ required_error: `${entity} slug is required` })
  .min(3, `${entity} slug must be at least 3 characters long`)
  .max(50, `${entity} slug must be at most 50 characters long`)
  .regex(SLUG_REGEX, `${entity} slug: ${SLUG_REGEX_MESSAGE}`);

const descriptionSchema = (entity) => z
  .string()
  .max(500, `${entity} description must be at most 500 characters long`)
  .optional()
  .nullable();

const avatarUrlSchema = (entity) => z
  .string()
  .max(2048, `${entity} avatar reference must be at most 2048 characters long`)
  .optional()
  .nullable();

module.exports = {
  emailSchema,
  passwordSchema,
  nameSchema,
  shortNameSchema,
  slugSchema,
  descriptionSchema,
  avatarUrlSchema,
};
