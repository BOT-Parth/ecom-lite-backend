const StoreRequestService = require('../services/store-request.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/async');

class StoreRequestController {
  create = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;
    const { userId } = req.user;

    const request = await StoreRequestService.createRequest({
      name,
      slug,
      userId,
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
