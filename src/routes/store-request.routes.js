/**
 * Layer:      Routes
 *
 * Purpose:
 * Registers all store-request endpoints (create, list, approve, reject).
 * List, approve, and reject are gated behind the APPROVE_STORE platform
 * permission so only SUPER_ADMIN users can access them.
 *
 * Called By:
 * src/routes/index.js  (mounted at /store-requests)
 *
 * Calls:
 * src/middleware/auth.middleware.js         (authenticate)
 * src/middleware/rbac.middleware.js         (requirePlatformPermission)
 * src/middleware/validation.middleware.js   (validate)
 * src/validators/store-request.validator.js
 * src/controllers/store-request.controller.js
 *
 * Request Flow:
 * Client
 *   → routes/index.js
 *   → store-request.routes.js
 *   → [authenticate] → [requirePlatformPermission]  (admin routes)
 *   → store-request.controller.js
 *   → store-request.service.js
 *   → store-request.repository.js / store.repository.js
 *   → Prisma → PostgreSQL
 */

const express = require('express');
const StoreRequestController = require('../controllers/store-request.controller');
const authenticate = require('../middleware/auth.middleware');
const { requirePlatformPermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validation.middleware');
const { createRequestSchema } = require('../validators/store-request.validator');
const { PLATFORM_PERMISSIONS } = require('../permissions/platform.permissions');

const router = express.Router();

router.post(
  '/',
  authenticate,
  validate(createRequestSchema),
  StoreRequestController.create
);
router.get(
  '/',
  authenticate,
  requirePlatformPermission(PLATFORM_PERMISSIONS.APPROVE_STORE),
  StoreRequestController.list
);
router.patch(
  '/:id/approve',
  authenticate,
  requirePlatformPermission(PLATFORM_PERMISSIONS.APPROVE_STORE),
  StoreRequestController.approve
);
router.patch(
  '/:id/reject',
  authenticate,
  requirePlatformPermission(PLATFORM_PERMISSIONS.APPROVE_STORE),
  StoreRequestController.reject
);

module.exports = router;
