/**
 * Layer:      Controllers
 *
 * Purpose:
 * Receives HTTP requests for inventory endpoints (get, update), delegates to
 * InventoryService, and returns formatted responses.
 *
 * Called By:
 * src/routes/inventory.routes.js
 *
 * Calls:
 * src/services/inventory.service.js
 * src/utils/response.js  (sendSuccess)
 * src/utils/async.js     (asyncHandler)
 *
 * Request Flow:
 * inventory.routes.js
 *   → inventory.controller.js
 *   → inventory.service.js
 *   → product.service.js (ownership check) + inventory.repository.js
 *   → Prisma → PostgreSQL
 */

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
