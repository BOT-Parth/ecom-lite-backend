const StoreRequestRepository = require('../repositories/store-request.repository');
const StoreRepository = require('../repositories/store.repository');
const {
  ConflictError,
  NotFoundError,
  BadRequestError,
} = require('../utils/errors');

class StoreRequestService {
  async createRequest({ name, slug, userId }) {
    // Check if an approved store already uses this slug
    const existingStore = await StoreRepository.findBySlug(slug);
    if (existingStore) {
      throw new ConflictError('A store with this slug already exists');
    }

    return StoreRequestRepository.create({ name, slug, userId });
  }

  async listRequests() {
    return StoreRequestRepository.listAll();
  }

  async approveRequest(requestId) {
    const request = await StoreRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Store request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError('Only pending store requests can be approved');
    }

    try {
      const result = await StoreRepository.approveStoreRequest(requestId);
      return result;
    } catch (err) {
      if (err.message === 'Store slug is already taken') {
        throw new ConflictError(
          'A store with this slug has already been approved'
        );
      }
      throw err;
    }
  }

  async rejectRequest(requestId) {
    const request = await StoreRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Store request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError('Only pending store requests can be rejected');
    }

    return StoreRequestRepository.updateStatus(requestId, 'REJECTED');
  }
}

module.exports = new StoreRequestService();
