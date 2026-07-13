const { prisma } = require('../config/prisma');

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
        approvalStatus: 'APPROVED',
        operationalStatus: 'OPEN',
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
      if (request.status !== 'PENDING') {
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
          approvalStatus: 'APPROVED',
          operationalStatus: 'OPEN',
        },
      });

      // 4. Update StoreRequest status and link store
      const updatedRequest = await tx.storeRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          storeId: store.id,
        },
      });

      // 5. Find store owner role ID
      const ownerRole = await tx.storeRole.findUnique({
        where: { name: 'STORE_OWNER' },
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
