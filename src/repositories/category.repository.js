const { prisma } = require('../config/prisma');

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

  async findBySlug(storeId, slug) {
    return prisma.category.findUnique({
      where: {
        storeId_slug: { storeId, slug },
      },
    });
  }

  async list(storeId) {
    return prisma.category.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    });
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
