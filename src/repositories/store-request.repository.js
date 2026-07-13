const { prisma } = require('../config/prisma');

class StoreRequestRepository {
  async create({ name, slug, userId }) {
    return prisma.storeRequest.create({
      data: {
        name,
        slug,
        userId,
        status: 'PENDING',
      },
    });
  }

  async findById(id) {
    return prisma.storeRequest.findUnique({
      where: { id },
    });
  }

  async listAll() {
    return prisma.storeRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id, status) {
    return prisma.storeRequest.update({
      where: { id },
      data: { status },
    });
  }
}

module.exports = new StoreRequestRepository();
