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
