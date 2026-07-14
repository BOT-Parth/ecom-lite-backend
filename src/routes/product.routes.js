/**
 * Layer:      Routes
 *
 * Purpose:
 * Registers all product management endpoints for a specific store.
 * Applies authentication, store-permission enforcement, and request validation
 * before forwarding to the product controller.
 *
 * Called By:
 * src/routes/index.js  (mounted at /stores/:storeId/products)
 *
 * Calls:
 * src/middleware/auth.middleware.js         (authenticate)
 * src/middleware/rbac.middleware.js         (requireStorePermission)
 * src/middleware/validation.middleware.js   (validate)
 * src/validators/catalog.validator.js
 * src/controllers/product.controller.js
 *
 * Request Flow:
 * Client
 *   → routes/index.js
 *   → product.routes.js
 *   → [authenticate] → [requireStorePermission] → [validate]
 *   → product.controller.js
 *   → product.service.js
 *   → product.repository.js
 *   → Prisma → PostgreSQL
 *
 * Notes:
 * Router is created with { mergeParams: true } so that :storeId from the
 * parent mount path is accessible in this router and its middleware.
 * GET endpoints are public (no authentication required).
 */

const express = require('express');
const ProductController = require('../controllers/product.controller');
const authenticate = require('../middleware/auth.middleware');
const { requireStorePermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createProductSchema,
  updateProductSchema,
} = require('../validators/catalog.validator');
const { STORE_PERMISSIONS } = require('../permissions/store.permissions');

// mergeParams is required to access :storeId from the parent mount path
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_PRODUCTS),
  validate(createProductSchema),
  ProductController.create
);

router.get('/', ProductController.list);
router.get('/:id', ProductController.getById);

router.patch(
  '/:id',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_PRODUCTS),
  validate(updateProductSchema),
  ProductController.update
);

router.delete(
  '/:id',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_PRODUCTS),
  ProductController.delete
);

module.exports = router;
