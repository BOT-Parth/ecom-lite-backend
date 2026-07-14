/**
 * Layer:      Permissions
 *
 * Purpose:
 * Defines all platform-level permission names used across the authorization system.
 * These are the string values that must be seeded in the database and referenced
 * in route middleware to gate platform-scoped (admin) operations.
 *
 * Called By:
 * src/routes/store-request.routes.js
 *
 * Calls:
 * Nothing — this is a pure definition module.
 *
 * Architecture note:
 * Middleware (rbac.middleware.js) resolves these names against the database at
 * runtime. Routes import these constants to avoid magic strings.
 */

const PLATFORM_PERMISSIONS = {
  APPROVE_STORE: 'APPROVE_STORE',
};

module.exports = { PLATFORM_PERMISSIONS };
