/**
 * Layer:      Constants
 *
 * Purpose:
 * Defines shared validation constants (regex patterns, lengths) used across
 * multiple validator files. Centralizing these ensures that the same rule is
 * not defined independently in separate places.
 *
 * Called By:
 * src/validators/catalog.validator.js
 * src/validators/store-request.validator.js
 *
 * Calls:
 * Nothing — this is a pure definition module.
 */

// Slug format: lowercase letters, numbers, and hyphens only.
// Example valid slug: "my-store", "product-123"
const SLUG_REGEX = /^[a-z0-9-]+$/;
const SLUG_REGEX_MESSAGE =
  'Must contain only lowercase alphanumeric characters and hyphens';

module.exports = {
  SLUG_REGEX,
  SLUG_REGEX_MESSAGE,
};
