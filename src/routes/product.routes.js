const express = require('express');
const ProductController = require('../controllers/product.controller');
const authenticate = require('../middleware/auth.middleware');
const { requireStorePermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createProductSchema,
  updateProductSchema,
} = require('../validators/catalog.validator');

// mergeParams is required to access :storeId from the parent mount path
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  requireStorePermission('MANAGE_PRODUCTS'),
  validate(createProductSchema),
  ProductController.create
);

router.get('/', ProductController.list);
router.get('/:id', ProductController.getById);

router.patch(
  '/:id',
  authenticate,
  requireStorePermission('MANAGE_PRODUCTS'),
  validate(updateProductSchema),
  ProductController.update
);

router.delete(
  '/:id',
  authenticate,
  requireStorePermission('MANAGE_PRODUCTS'),
  ProductController.delete
);

module.exports = router;
