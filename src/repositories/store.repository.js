/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles all database operations for the Store and UserStoreMembership models.
 * Includes the transactional store-approval workflow that atomically creates a
 * store, updates the request status, and assigns the STORE_OWNER membership.
 *
 * Called By:
 * src/services/store.service.js
 * src/services/store-request.service.js
 *
 * Calls:
 * src/config/prisma.js          (Prisma client)
 * src/constants/store.js        (STORE_REQUEST_STATUS, STORE_OPERATIONAL_STATUS, STORE_ROLES)
 *
 * Request Flow:
 * store.service.js / store-request.service.js
 *   → store.repository.js
 *   → Prisma ($transaction) → PostgreSQL
 */

const { prisma } = require('../config/prisma');
const {
  STORE_REQUEST_STATUS,
  STORE_OPERATIONAL_STATUS,
  STORE_ROLES,
} = require('../constants/store');

class StoreRepository {
  async findBySlug(slug) {
    return prisma.store.findUnique({
      where: { slug },
    });
  }

  async findById(id) {
    return prisma.store.findUnique({
      where: { id },
    });
  }

  async listPublic() {
    return prisma.store.findMany({
      where: {
        approvalStatus: STORE_REQUEST_STATUS.APPROVED,
        operationalStatus: STORE_OPERATIONAL_STATUS.OPEN,
      },
      orderBy: { name: 'asc' },
    });
  }

  async listByUserId(userId) {
    return prisma.store.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async approveStoreRequest(requestId) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch store request
      const request = await tx.storeRequest.findUnique({
        where: { id: requestId },
      });
      if (!request) {
        throw new Error('Store request not found');
      }
      if (request.status !== STORE_REQUEST_STATUS.PENDING) {
        throw new Error('Store request is not pending');
      }

      // 2. Check if a store with this slug already exists
      const existingStore = await tx.store.findUnique({
        where: { slug: request.slug },
      });
      if (existingStore) {
        throw new Error('Store slug is already taken');
      }

      // 3. Create the Store
      const store = await tx.store.create({
        data: {
          name: request.name,
          slug: request.slug,
          approvalStatus: STORE_REQUEST_STATUS.APPROVED,
          operationalStatus: STORE_OPERATIONAL_STATUS.OPEN,
        },
      });

      // 4. Update StoreRequest status and link store
      const updatedRequest = await tx.storeRequest.update({
        where: { id: requestId },
        data: {
          status: STORE_REQUEST_STATUS.APPROVED,
          storeId: store.id,
        },
      });

      // 5. Find store owner role ID
      const ownerRole = await tx.storeRole.findUnique({
        where: { name: STORE_ROLES.STORE_OWNER },
      });
      if (!ownerRole) {
        throw new Error('STORE_OWNER store role not found in database');
      }

      // 6. Create UserStoreMembership
      const membership = await tx.userStoreMembership.create({
        data: {
          userId: request.userId,
          storeId: store.id,
          roleId: ownerRole.id,
        },
      });

      return { store, request: updatedRequest, membership };
    });
  }
}

module.exports = new StoreRepository();
