const express = require('express');
const CategoryController = require('../controllers/category.controller');
const authenticate = require('../middleware/auth.middleware');
const { requireStorePermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createCategorySchema,
  updateCategorySchema,
} = require('../validators/catalog.validator');

// mergeParams is required to access :storeId from the parent mount path
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  requireStorePermission('MANAGE_PRODUCTS'),
  validate(createCategorySchema),
  CategoryController.create
);

router.get('/', CategoryController.list);

router.patch(
  '/:id',
  authenticate,
  requireStorePermission('MANAGE_PRODUCTS'),
  validate(updateCategorySchema),
  CategoryController.update
);

router.delete(
  '/:id',
  authenticate,
  requireStorePermission('MANAGE_PRODUCTS'),
  CategoryController.delete
);

module.exports = router;
