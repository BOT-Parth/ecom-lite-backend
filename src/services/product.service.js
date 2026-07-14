/**
 * Layer:      Service
 *
 * Purpose:
 * Owns all business logic for product operations: creation (category-store
 * ownership validation), listing (optional category filter), retrieval, update,
 * and deletion. All operations are scoped to a specific store.
 *
 * Called By:
 * src/controllers/product.controller.js
 * src/services/inventory.service.js  (getProductById — for ownership validation)
 *
 * Calls:
 * src/repositories/product.repository.js
 * src/repositories/category.repository.js  (to validate categoryId belongs to store)
 * src/utils/errors.js
 *
 * Request Flow:
 * product.controller.js
 *   → product.service.js
 *   → product.repository.js
 *   → Prisma → PostgreSQL
 */

const ProductRepository = require('../repositories/product.repository');
const CategoryRepository = require('../repositories/category.repository');
const { NotFoundError } = require('../utils/errors');

class ProductService {
  async createProduct({
    name,
    description,
    price,
    imageUrls,
    categoryId,
    storeId,
  }) {
    if (categoryId) {
      const category = await CategoryRepository.findById(categoryId);
      if (!category || category.storeId !== storeId) {
        throw new NotFoundError('Category not found in this store');
      }
    }

    return ProductRepository.create({
      name,
      description,
      price,
      imageUrls,
      categoryId,
      storeId,
    });
  }

  async listProducts(storeId, categoryId) {
    if (categoryId) {
      const category = await CategoryRepository.findById(categoryId);
      if (!category || category.storeId !== storeId) {
        throw new NotFoundError('Category not found in this store');
      }
    }

    return ProductRepository.list(storeId, categoryId);
  }

  async getProductById(id, storeId) {
    const product = await ProductRepository.findById(id);
    if (!product || product.storeId !== storeId) {
      throw new NotFoundError('Product not found in this store');
    }

    return product;
  }

  async updateProduct(id, storeId, data) {
    const product = await ProductRepository.findById(id);
    if (!product || product.storeId !== storeId) {
      throw new NotFoundError('Product not found in this store');
    }

    if (data.categoryId) {
      const category = await CategoryRepository.findById(data.categoryId);
      if (!category || category.storeId !== storeId) {
        throw new NotFoundError('Category not found in this store');
      }
    }

    return ProductRepository.update(id, data);
  }

  async deleteProduct(id, storeId) {
    const product = await ProductRepository.findById(id);
    if (!product || product.storeId !== storeId) {
      throw new NotFoundError('Product not found in this store');
    }

    return ProductRepository.delete(id);
  }
}

module.exports = new ProductService();
