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
