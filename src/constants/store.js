/**
 * Layer:      Constants
 *
 * Purpose:
 * Defines shared store-related string constants used across repositories and
 * services. Centralizing these values ensures that enum strings match the
 * database schema in a single place and eliminates magic strings.
 *
 * Called By:
 * src/repositories/store.repository.js
 * src/repositories/store-request.repository.js
 * src/services/store-request.service.js
 *
 * Calls:
 * Nothing — this is a pure definition module.
 */

// Store request lifecycle statuses (mirrors StoreRequestStatus Prisma enum)
const STORE_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Store operational statuses (mirrors StoreOperationalStatus Prisma enum)
const STORE_OPERATIONAL_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  SUSPENDED: 'SUSPENDED',
};

// Store role names (mirrors StoreRole names seeded in the database)
const STORE_ROLES = {
  STORE_OWNER: 'STORE_OWNER',
  STORE_STAFF: 'STORE_STAFF',
};

module.exports = {
  STORE_REQUEST_STATUS,
  STORE_OPERATIONAL_STATUS,
  STORE_ROLES,
};
