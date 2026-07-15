/**
 * Layer:      Routes
 *
 * Purpose:
 * Registers store directory endpoints: listing public (approved + open) stores,
 * listing the authenticated user's own stores, and listing all stores on the
 * platform for platform administration (SUPER_ADMIN only).
 *
 * Called By:
 * src/routes/index.js  (mounted at /stores)
 *
 * Calls:
 * src/middleware/auth.middleware.js          (authenticate)
 * src/middleware/rbac.middleware.js          (requirePlatformPermission)
 * src/controllers/store.controller.js
 *
 * Request Flow:
 * Client
 *   → routes/index.js
 *   → store.routes.js
 *   → [authenticate] → [requirePlatformPermission] (for /platform)
 *   → store.controller.js
 *   → store.service.js
 *   → store.repository.js
 *   → Prisma → PostgreSQL
 */

const express = require('express');
const StoreController = require('../controllers/store.controller');
const authenticate = require('../middleware/auth.middleware');
const { requirePlatformPermission, requireStorePermission } = require('../middleware/rbac.middleware');
const { PLATFORM_PERMISSIONS } = require('../permissions/platform.permissions');
const { STORE_PERMISSIONS } = require('../permissions/store.permissions');
const validate = require('../middleware/validation.middleware');
const { updateSettingsSchema } = require('../validators/store.validator');

const router = express.Router();

router.get('/my', authenticate, StoreController.listMyStores);
router.get(
  '/platform',
  authenticate,
  requirePlatformPermission(PLATFORM_PERMISSIONS.APPROVE_STORE),
  StoreController.listPlatformStores
);

router.get(
  '/:storeId/settings',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_STORE),
  StoreController.getSettings
);

router.patch(
  '/:storeId/settings',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_STORE),
  validate(updateSettingsSchema),
  StoreController.updateSettings
);

router.get('/', StoreController.listPublicStores);

module.exports = router;
