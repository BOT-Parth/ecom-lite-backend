/**
 * Layer:      Service
 *
 * Purpose:
 * Owns all business logic for the store-request lifecycle: creating requests,
 * approving them (delegating the transactional workflow to the repository),
 * and rejecting them. Enforces status guards so only PENDING requests can
 * be acted upon.
 *
 * Called By:
 * src/controllers/store-request.controller.js
 *
 * Calls:
 * src/repositories/store-request.repository.js
 * src/repositories/store.repository.js
 * src/constants/store.js  (STORE_REQUEST_STATUS)
 * src/utils/errors.js
 *
 * Request Flow:
 * store-request.controller.js
 *   → store-request.service.js
 *   → store-request.repository.js / store.repository.js
 *   → Prisma → PostgreSQL
 */

const StoreRequestRepository = require('../repositories/store-request.repository');
const StoreRepository = require('../repositories/store.repository');
const {
  ConflictError,
  NotFoundError,
  BadRequestError,
} = require('../utils/errors');
const { STORE_REQUEST_STATUS } = require('../constants/store');

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

    if (request.status !== STORE_REQUEST_STATUS.PENDING) {
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

    if (request.status !== STORE_REQUEST_STATUS.PENDING) {
      throw new BadRequestError('Only pending store requests can be rejected');
    }

    return StoreRequestRepository.updateStatus(
      requestId,
      STORE_REQUEST_STATUS.REJECTED
    );
  }
}

module.exports = new StoreRequestService();
