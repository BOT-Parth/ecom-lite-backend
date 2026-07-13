const ProductRepository = require('../repositories/product.repository');
const InventoryRepository = require('../repositories/inventory.repository');
const { NotFoundError } = require('../utils/errors');

class InventoryService {
  async getInventory({ storeId, productId }) {
    const product = await ProductRepository.findById(productId);
    if (!product || product.storeId !== storeId) {
      throw new NotFoundError('Product not found in this store');
    }

    return InventoryRepository.findByProductId(productId);
  }

  async updateInventory({ storeId, productId, quantity }) {
    const product = await ProductRepository.findById(productId);
    if (!product || product.storeId !== storeId) {
      throw new NotFoundError('Product not found in this store');
    }

    return InventoryRepository.updateQuantity(productId, quantity);
  }
}

module.exports = new InventoryService();
