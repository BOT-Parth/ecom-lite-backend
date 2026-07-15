/**
 * Layer:      Service
 *
 * Purpose:
 * Owns business logic for store directory queries: listing the authenticated
 * user's stores, listing all publicly approved + open stores, and listing all
 * stores on the platform (Platform Store Directory).
 *
 * Called By:
 * src/controllers/store.controller.js
 *
 * Calls:
 * src/repositories/store.repository.js
 *
 * Request Flow:
 * store.controller.js
 *   → store.service.js
 *   → store.repository.js
 *   → Prisma → PostgreSQL
 */

const StoreRepository = require('../repositories/store.repository');
const { NotFoundError } = require('../utils/errors');

class StoreService {
  async listMyStores(userId) {
    return StoreRepository.listByUserId(userId);
  }

  async listPublicStores() {
    return StoreRepository.listPublic();
  }

  async listPlatformStores() {
    return StoreRepository.listPlatformStores();
  }

  async getStoreSettings(storeId) {
    const store = await StoreRepository.findById(storeId);
    if (!store) {
      throw new NotFoundError('Store not found');
    }
    return {
      name: store.name,
      description: store.description,
      avatarUrl: store.avatarUrl,
    };
  }

  async updateStoreSettings(storeId, { name, description, avatarUrl }) {
    const store = await StoreRepository.findById(storeId);
    if (!store) {
      throw new NotFoundError('Store not found');
    }
    return StoreRepository.updateSettings(storeId, { name, description, avatarUrl });
  }
}

module.exports = new StoreService();
