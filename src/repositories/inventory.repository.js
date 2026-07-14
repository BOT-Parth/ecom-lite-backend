/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles all database operations for the Inventory model.
 * Implements a lazy-creation fallback in findByProductId: if no inventory
 * record exists for a product (legacy data), one is created automatically
 * with quantity 0.
 *
 * Called By:
 * src/services/inventory.service.js
 *
 * Calls:
 * src/config/prisma.js  (Prisma client)
 *
 * Request Flow:
 * inventory.service.js
 *   → inventory.repository.js
 *   → Prisma → PostgreSQL
 */

const { prisma } = require('../config/prisma');

class InventoryRepository {
  async findByProductId(productId) {
    let inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      // Lazy creation fallback for existing database products
      inventory = await prisma.inventory.create({
        data: {
          productId,
          quantity: 0,
        },
      });
    }

    return inventory;
  }

  async updateQuantity(productId, quantity) {
    return prisma.inventory.upsert({
      where: { productId },
      update: { quantity },
      create: {
        productId,
        quantity,
      },
    });
  }
}

module.exports = new InventoryRepository();
