/**
 * Layer:      Service
 *
 * Purpose:
 * Owns business logic for store directory queries: listing the authenticated
 * user's stores and listing all publicly approved + open stores.
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

class StoreService {
  async listMyStores(userId) {
    return StoreRepository.listByUserId(userId);
  }

  async listPublicStores() {
    return StoreRepository.listPublic();
  }
}

module.exports = new StoreService();
