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
  async create({ name, slug, userId }) {
    return prisma.storeRequest.create({
      data: {
        name,
        slug,
        userId,
        status: STORE_REQUEST_STATUS.PENDING,
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
