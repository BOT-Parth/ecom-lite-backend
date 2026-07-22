/**
 * Layer:      Routes
 * 
 * Purpose:
 * Registers storefront customer endpoints.
 * Handles customer registration, login, and authenticated profile/order routes.
 */

const express = require('express');
const CustomerAuthController = require('../controllers/customer-auth.controller');
const OrderController = require('../controllers/order.controller');
const authenticateCustomer = require('../middleware/customer-auth.middleware');
const validate = require('../middleware/validation.middleware');
const { registerCustomerSchema, loginCustomerSchema } = require('../validators/customer.validator');

const router = express.Router({ mergeParams: true });

// --- PUBLIC ROUTES ---
router.post(
  '/register',
  validate(registerCustomerSchema),
  CustomerAuthController.register
);

router.post(
  '/login',
  validate(loginCustomerSchema),
  CustomerAuthController.login
);

router.post(
  '/logout',
  CustomerAuthController.logout
);

// --- PROTECTED ROUTES (Authenticated Customer) ---
router.get(
  '/me',
  authenticateCustomer,
  CustomerAuthController.getProfile
);

router.get(
  '/me/orders',
  authenticateCustomer,
  OrderController.listCustomerOrders
);

router.get(
  '/me/orders/:id',
  authenticateCustomer,
  OrderController.getCustomerOrder
);

module.exports = router;
