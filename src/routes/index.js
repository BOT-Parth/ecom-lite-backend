const express = require('express');
const authRoutes = require('./auth.routes');
const storeRequestRoutes = require('./store-request.routes');
const storeRoutes = require('./store.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/store-requests', storeRequestRoutes);
router.use('/stores', storeRoutes);

module.exports = router;
