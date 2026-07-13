const { prisma } = require('../config/prisma');

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
    const whereClause = { storeId };
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    return prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
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
