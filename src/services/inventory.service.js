/**
 * Layer:      Service
 *
 * Purpose:
 * Owns business logic for inventory retrieval and updates.
 * Delegates product-store ownership validation to ProductService so that
 * the rule is enforced in one place only.
 *
 * Called By:
 * src/controllers/inventory.controller.js
 *
 * Calls:
 * src/services/product.service.js       (ownership validation via getProductById)
 * src/repositories/inventory.repository.js
 *
 * Request Flow:
 * inventory.controller.js
 *   → inventory.service.js
 *   → product.service.js     (validates product belongs to store)
 *   → inventory.repository.js
 *   → Prisma → PostgreSQL
 */

const ProductService = require('./product.service');
const InventoryRepository = require('../repositories/inventory.repository');

class InventoryService {
  async getInventory({ storeId, productId }) {
    // Delegates ownership check to ProductService (single source of truth)
    await ProductService.getProductById(productId, storeId);

    return InventoryRepository.findByProductId(productId);
  }

  async updateInventory({ storeId, productId, quantity }) {
    // Delegates ownership check to ProductService (single source of truth)
    await ProductService.getProductById(productId, storeId);

    return InventoryRepository.updateQuantity(productId, quantity);
  }
}

module.exports = new InventoryService();
