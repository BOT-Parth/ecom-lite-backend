/**
 * Layer:      Routes
 *
 * Purpose:
 * Registers all customer order endpoints for a specific store.
 * Applies authentication, store-permission enforcement, and request validation
 * before forwarding to the order controller.
 *
 * Called By:
 * src/routes/index.js  (mounted at /stores/:storeId/orders)
 *
 * Notes:
 * Router is created with { mergeParams: true } so that :storeId from the
 * parent mount path is accessible in this router and its middleware.
 */

const express = require('express');
const OrderController = require('../controllers/order.controller');
const authenticate = require('../middleware/auth.middleware');
const authenticateCustomer = require('../middleware/customer-auth.middleware');
const { requireStorePermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require('../validators/order.validator');
const { STORE_PERMISSIONS } = require('../permissions/store.permissions');

const router = express.Router({ mergeParams: true });

// --- PROTECTED ROUTES (Customer) ---
router.post(
  '/',
  authenticateCustomer,
  validate(createOrderSchema),
  OrderController.placeOrder
);

// --- PROTECTED ROUTES (Store Staff/Owner) ---
router.get(
  '/',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_ORDERS),
  OrderController.listOrders
);

router.get(
  '/:id',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_ORDERS),
  OrderController.getOrder
);

router.patch(
  '/:id/status',
  authenticate,
  requireStorePermission(STORE_PERMISSIONS.MANAGE_ORDERS),
  validate(updateOrderStatusSchema),
  OrderController.updateStatus
);

module.exports = router;
