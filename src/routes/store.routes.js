const express = require('express');
const StoreController = require('../controllers/store.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/my', authenticate, StoreController.listMyStores);
router.get('/', StoreController.listPublicStores);

module.exports = router;
