/**
 * Layer:      Routes
 *
 * Purpose:
 * Registers all category management endpoints for a specific store.
 * Applies authentication, store-permission enforcement, and request validation
 * before forwarding to the category controller.
 *
 * Called By:
 * src/routes/index.js  (mounted at /stores/:storeId/categories)
 *
 * Calls:
 * src/middleware/auth.middleware.js         (authenticate)
 * src/middleware/rbac.middleware.js         (requireStorePermission)
 * src/middleware/validation.middleware.js   (validate)
 * src/validators/catalog.validator.js
 * src/controllers/category.controller.js
 *
 * Request Flow:
 * Client
 *   → routes/index.js
 *   → category.routes.js
 *   → [authenticate] → [requireStorePermission] → [validate]
 *   → category.controller.js
 *   → category.service.js
 *   → category.repository.js
 *   → Prisma → PostgreSQL
 *
 * Notes:
 * Router is created with { mergeParams: true } so that :storeId from the
 * parent mount path is accessible in this router and its middleware.
 */

const express = require("express");
const CategoryController = require("../controllers/category.controller");
const authenticate = require("../middleware/auth.middleware");
const { requireStorePermission } = require("../middleware/rbac.middleware");
const validate = require("../middleware/validation.middleware");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/catalog.validator");
const { STORE_PERMISSIONS } = require("../permissions/store.permissions");

// mergeParams is required to access :storeId from the parent mount path
const router = express.Router({ mergeParams: true });

router.post(
  "/",
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_CATEGORIES),
  validate(createCategorySchema),
  CategoryController.create,
);

router.get("/", CategoryController.list);

router.patch(
  "/:id",
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_CATEGORIES),
  validate(updateCategorySchema),
  CategoryController.update,
);

router.delete(
  "/:id",
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_CATEGORIES),
  CategoryController.delete,
);

module.exports = router;
