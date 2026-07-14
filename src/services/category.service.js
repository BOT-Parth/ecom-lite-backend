/**
 * Layer:      Service
 *
 * Purpose:
 * Owns all business logic for category operations: creation (slug uniqueness
 * check), listing, updating (ownership + slug uniqueness check), and deletion
 * (ownership check). All operations are scoped to a specific store.
 *
 * Called By:
 * src/controllers/category.controller.js
 *
 * Calls:
 * src/repositories/category.repository.js
 * src/utils/errors.js
 *
 * Request Flow:
 * category.controller.js
 *   → category.service.js
 *   → category.repository.js
 *   → Prisma → PostgreSQL
 */

const CategoryRepository = require('../repositories/category.repository');
const { ConflictError, NotFoundError } = require('../utils/errors');

class CategoryService {
  async createCategory({ name, slug, storeId }) {
    const existingCategory = await CategoryRepository.findBySlug(storeId, slug);
    if (existingCategory) {
      throw new ConflictError(
        'Category slug is already registered in this store'
      );
    }

    return CategoryRepository.create({ name, slug, storeId });
  }

  async listCategories(storeId) {
    return CategoryRepository.list(storeId);
  }

  async updateCategory(id, storeId, data) {
    const category = await CategoryRepository.findById(id);
    if (!category || category.storeId !== storeId) {
      throw new NotFoundError('Category not found in this store');
    }

    if (data.slug) {
      const existingCategory = await CategoryRepository.findBySlug(
        storeId,
        data.slug
      );
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictError(
          'Category slug is already in use in this store'
        );
      }
    }

    return CategoryRepository.update(id, data);
  }

  async deleteCategory(id, storeId) {
    const category = await CategoryRepository.findById(id);
    if (!category || category.storeId !== storeId) {
      throw new NotFoundError('Category not found in this store');
    }

    return CategoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
