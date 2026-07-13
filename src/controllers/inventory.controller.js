const InventoryService = require('../services/inventory.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/async');

class InventoryController {
  getInventory = asyncHandler(async (req, res) => {
    const { storeId, productId } = req.params;
    const inventory = await InventoryService.getInventory({
      storeId,
      productId,
    });
    return sendSuccess(
      res,
      'Inventory retrieved successfully',
      { inventory },
      200
    );
  });

  updateInventory = asyncHandler(async (req, res) => {
    const { storeId, productId } = req.params;
    const { quantity } = req.body;

    const inventory = await InventoryService.updateInventory({
      storeId,
      productId,
      quantity,
    });

    return sendSuccess(
      res,
      'Inventory updated successfully',
      { inventory },
      200
    );
  });
}

module.exports = new InventoryController();
