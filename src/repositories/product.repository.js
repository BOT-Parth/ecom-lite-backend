/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles all database operations for the Product model.
 * On creation, automatically creates an associated Inventory record with
 * quantity 0 inside a single Prisma nested write (not a separate transaction).
 *
 * Called By:
 * src/services/product.service.js
 *
 * Calls:
 * src/config/prisma.js  (Prisma client)
 *
 * Request Flow:
 * product.service.js
 *   → product.repository.js
 *   → Prisma → PostgreSQL
 */

const { prisma } = require('../config/prisma');
const { withStoreScope } = require('./helpers');

class ProductRepository {
  async create({ name, description, price, imageUrls, categoryId, storeId }) {
    return prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrls: imageUrls || [],
        categoryId: categoryId || null,
        storeId,
        inventory: {
          create: {
            quantity: 0,
          },
        },
      },
      include: { category: true, inventory: true },
    });
  }

  async findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, inventory: true },
    });
  }

  async list(storeId, categoryId) {
    const query = {
      include: { category: true },
      orderBy: { name: 'asc' },
    };
    if (categoryId) {
      query.where = { categoryId };
    }

    return prisma.product.findMany(withStoreScope(storeId, query));
  }

  async update(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id) {
    return prisma.product.delete({
      where: { id },
    });
  }
}

module.exports = new ProductRepository();
