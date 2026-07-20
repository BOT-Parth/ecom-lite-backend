/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles all database operations for the Category model.
 * This is the only file that queries the category Prisma model directly.
 *
 * Called By:
 * src/services/category.service.js
 * src/services/product.service.js  (to validate categoryId belongs to store)
 *
 * Calls:
 * src/config/prisma.js  (Prisma client)
 *
 * Request Flow:
 * category.service.js / product.service.js
 *   → category.repository.js
 *   → Prisma → PostgreSQL
 */

const { prisma } = require('../config/prisma');
const { withStoreScope } = require('./helpers');

class CategoryRepository {
  async create({ name, slug, storeId }) {
    return prisma.category.create({
      data: { name, slug, storeId },
    });
  }

  async findById(id) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  // Note: Cannot use withStoreScope here because Prisma findUnique requires the where clause
  // to exactly match the compound unique constraint (storeId_slug).
  async findBySlug(storeId, slug) {
    return prisma.category.findUnique({
      where: {
        storeId_slug: { storeId, slug },
      },
    });
  }

  async list(storeId) {
    return prisma.category.findMany(
      withStoreScope(storeId, {
        orderBy: { name: 'asc' },
      })
    );
  }

  async update(id, data) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.category.delete({
      where: { id },
    });
  }
}

module.exports = new CategoryRepository();
