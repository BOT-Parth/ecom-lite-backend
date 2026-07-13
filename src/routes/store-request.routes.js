const express = require('express');
const StoreRequestController = require('../controllers/store-request.controller');
const authenticate = require('../middleware/auth.middleware');
const { requirePlatformPermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validation.middleware');
const { createRequestSchema } = require('../validators/store-request.validator');

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
  requirePlatformPermission('APPROVE_STORE'),
  StoreRequestController.list
);
router.patch(
  '/:id/approve',
  authenticate,
  requirePlatformPermission('APPROVE_STORE'),
  StoreRequestController.approve
);
router.patch(
  '/:id/reject',
  authenticate,
  requirePlatformPermission('APPROVE_STORE'),
  StoreRequestController.reject
);

module.exports = router;
