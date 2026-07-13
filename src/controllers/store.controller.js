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
