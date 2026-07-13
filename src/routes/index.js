const express = require('express');
const authRoutes = require('./auth.routes');
const storeRequestRoutes = require('./store-request.routes');
const storeRoutes = require('./store.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const inventoryRoutes = require('./inventory.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/store-requests', storeRequestRoutes);
router.use('/stores', storeRoutes);
router.use('/stores/:storeId/categories', categoryRoutes);
router.use('/stores/:storeId/products', productRoutes);
router.use('/stores/:storeId/products/:productId/inventory', inventoryRoutes);

module.exports = router;
