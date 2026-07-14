/**
 * Layer:      Routes
 *
 * Purpose:
 * Registers store directory endpoints: listing public (approved + open) stores
 * and listing the authenticated user's own stores.
 *
 * Called By:
 * src/routes/index.js  (mounted at /stores)
 *
 * Calls:
 * src/middleware/auth.middleware.js  (authenticate — for /my)
 * src/controllers/store.controller.js
 *
 * Request Flow:
 * Client
 *   → routes/index.js
 *   → store.routes.js
 *   → [authenticate]  (GET /my only)
 *   → store.controller.js
 *   → store.service.js
 *   → store.repository.js
 *   → Prisma → PostgreSQL
 */

const express = require('express');
const StoreController = require('../controllers/store.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/my', authenticate, StoreController.listMyStores);
router.get('/', StoreController.listPublicStores);

module.exports = router;
