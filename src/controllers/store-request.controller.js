/**
 * Layer:      Controllers
 *
 * Purpose:
 * Receives HTTP requests for store-request endpoints (create, list, approve,
 * reject), delegates to StoreRequestService, and returns formatted responses.
 * Controllers are intentionally thin — no business logic lives here.
 *
 * Called By:
 * src/routes/store-request.routes.js
 *
 * Calls:
 * src/services/store-request.service.js
 * src/utils/response.js  (sendSuccess)
 * src/utils/async.js     (asyncHandler)
 *
 * Request Flow:
 * store-request.routes.js
 *   → store-request.controller.js
 *   → store-request.service.js
 *   → store-request.repository.js / store.repository.js
 *   → Prisma → PostgreSQL
 */

const StoreRequestService = require('../services/store-request.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/async');

class StoreRequestController {
  create = asyncHandler(async (req, res) => {
    const { name, slug, description, avatarUrl } = req.body;
    const { userId } = req.user;

    const request = await StoreRequestService.createRequest({
      name,
      slug,
      userId,
      description,
      avatarUrl,
    });

    return sendSuccess(
      res,
      'Store creation request submitted successfully',
      { request },
      201
    );
  });

  list = asyncHandler(async (req, res) => {
    const requests = await StoreRequestService.listRequests();
    return sendSuccess(
      res,
      'Store creation requests retrieved successfully',
      { requests },
      200
    );
  });

  approve = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await StoreRequestService.approveRequest(id);
    return sendSuccess(
      res,
      'Store request approved and store created successfully',
      result,
      200
    );
  });

  reject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await StoreRequestService.rejectRequest(id);
    return sendSuccess(
      res,
      'Store request rejected successfully',
      { request },
      200
    );
  });
}

module.exports = new StoreRequestController();
