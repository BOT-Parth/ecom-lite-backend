/**
 * Layer:      Controllers
 *
 * Purpose:
 * Receives HTTP requests for store directory endpoints (my stores, public
 * stores, and platform-wide stores), delegates to StoreService, and returns
 * formatted responses.
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

  listPlatformStores = asyncHandler(async (req, res) => {
    const stores = await StoreService.listPlatformStores();
    return sendSuccess(
      res,
      'Platform stores directory retrieved successfully',
      { stores },
      200
    );
  });

  getSettings = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const settings = await StoreService.getStoreSettings(storeId);
    return sendSuccess(
      res,
      'Store settings retrieved successfully',
      { settings },
      200
    );
  });

  updateSettings = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const { name, description, avatarUrl } = req.body;
    const settings = await StoreService.updateStoreSettings(storeId, {
      name,
      description,
      avatarUrl,
    });
    return sendSuccess(
      res,
      'Store settings updated successfully',
      { settings },
      200
    );
  });
}

module.exports = new StoreController();
