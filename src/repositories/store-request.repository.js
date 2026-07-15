/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles all database operations for the StoreRequest model.
 * This is the only file that queries the storeRequest Prisma model directly.
 *
 * Called By:
 * src/services/store-request.service.js
 *
 * Calls:
 * src/config/prisma.js  (Prisma client)
 * src/constants/store.js  (STORE_REQUEST_STATUS)
 *
 * Request Flow:
 * store-request.service.js
 *   → store-request.repository.js
 *   → Prisma → PostgreSQL
 */

const { prisma } = require('../config/prisma');
const { STORE_REQUEST_STATUS } = require('../constants/store');

class StoreRequestRepository {
  async create({ name, slug, userId, description, avatarUrl }) {
    return prisma.storeRequest.create({
      data: {
        name,
        slug,
        userId,
        description,
        avatarUrl,
        status: STORE_REQUEST_STATUS.PENDING,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        avatarUrl: true,
        status: true,
        userId: true,
        storeId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id) {
    return prisma.storeRequest.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        avatarUrl: true,
        status: true,
        userId: true,
        storeId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listPlatformStoreRequests() {
    return prisma.storeRequest.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        avatarUrl: true,
        status: true,
        userId: true,
        storeId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id, status) {
    return prisma.storeRequest.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        storeId: true,
      },
    });
  }
}

module.exports = new StoreRequestRepository();
