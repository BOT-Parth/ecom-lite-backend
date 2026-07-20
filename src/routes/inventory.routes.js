/**
 * Layer:      Routes
 *
 * Purpose:
 * Registers inventory endpoints for a specific product within a store.
 * GET is public. PATCH requires authentication and the MANAGE_PRODUCTS
 * store permission.
 *
 * Called By:
 * src/routes/index.js  (mounted at /stores/:storeId/products/:productId/inventory)
 *
 * Calls:
 * src/middleware/auth.middleware.js         (authenticate)
 * src/middleware/rbac.middleware.js         (requireStorePermission)
 * src/middleware/validation.middleware.js   (validate)
 * src/validators/inventory.validator.js
 * src/controllers/inventory.controller.js
 *
 * Request Flow:
 * Client
 *   → routes/index.js
 *   → inventory.routes.js
 *   → [authenticate] → [requireStorePermission] → [validate]  (PATCH only)
 *   → inventory.controller.js
 *   → inventory.service.js
 *   → inventory.repository.js
 *   → Prisma → PostgreSQL
 *
 * Notes:
 * Router is created with { mergeParams: true } so that :storeId and
 * :productId from parent mount paths are accessible here.
 */

const express = require('express');
const InventoryController = require('../controllers/inventory.controller');
const authenticate = require('../middleware/auth.middleware');
const { requireStorePermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validation.middleware');
const { updateInventorySchema } = require('../validators/inventory.validator');
const { STORE_PERMISSIONS } = require('../permissions/store.permissions');

// mergeParams is required to access :storeId and :productId from parent mount path
const router = express.Router({ mergeParams: true });

router.get(
  '/',
  InventoryController.getInventory
);

router.patch(
  '/',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_INVENTORY),
  validate(updateInventorySchema),
  InventoryController.updateInventory
);

module.exports = router;
