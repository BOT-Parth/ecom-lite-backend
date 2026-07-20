/**
 * Layer:      Permissions
 *
 * Purpose:
 * Defines all store-level permission names used across the authorization system.
 * These are the string values that must be seeded in the database and referenced
 * in route middleware to gate store-scoped operations.
 *
 * Called By:
 * src/routes/category.routes.js
 * src/routes/product.routes.js
 * src/routes/inventory.routes.js
 *
 * Calls:
 * Nothing — this is a pure definition module.
 *
 * Architecture note:
 * Middleware (rbac.middleware.js) resolves these names against the database at
 * runtime. Routes import these constants to avoid magic strings.
 */

const STORE_PERMISSIONS = {
  MANAGE_PRODUCTS: 'MANAGE_PRODUCTS',
  MANAGE_STORE: 'MANAGE_STORE',
  MANAGE_ORDERS: 'MANAGE_ORDERS',
  MANAGE_CATEGORIES: 'MANAGE_CATEGORIES',
  MANAGE_INVENTORY: 'MANAGE_INVENTORY',
};

module.exports = { STORE_PERMISSIONS };
