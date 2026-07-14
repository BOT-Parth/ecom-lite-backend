/**
 * Layer:      Controllers
 *
 * Purpose:
 * Receives HTTP requests for store directory endpoints (my stores, public
 * stores), delegates to StoreService, and returns formatted responses.
 *
 * Called By:
 * src/routes/store.routes.js
 *
 * Calls:
 * src/services/store.service.js
 * src/utils/response.js  (sendSuccess)
 * src/utils/async.js     (asyncHandler)
 *
 * Request Flow:
 * store.routes.js
 *   → store.controller.js
 *   → store.service.js
 *   → store.repository.js
 *   → Prisma → PostgreSQL
 */

const StoreService = require('../services/store.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/async');

class StoreController {
  listMyStores = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const stores = await StoreService.listMyStores(userId);
    return sendSuccess(
      res,
      'User stores retrieved successfully',
      { stores },
      200
    );
  });

  listPublicStores = asyncHandler(async (req, res) => {
    const stores = await StoreService.listPublicStores();
    return sendSuccess(
      res,
      'Public stores directory retrieved successfully',
      { stores },
      200
    );
  });
}

module.exports = new StoreController();
