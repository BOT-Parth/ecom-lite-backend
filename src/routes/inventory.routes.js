const express = require('express');
const InventoryController = require('../controllers/inventory.controller');
const authenticate = require('../middleware/auth.middleware');
const { requireStorePermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validation.middleware');
const { updateInventorySchema } = require('../validators/inventory.validator');

// mergeParams is required to access :storeId and :productId from parent mount path
const router = express.Router({ mergeParams: true });

router.get('/', InventoryController.getInventory);

router.patch(
  '/',
  authenticate,
  requireStorePermission('MANAGE_PRODUCTS'),
  validate(updateInventorySchema),
  InventoryController.updateInventory
);

module.exports = router;
