const PermissionService = require('../services/permission.service');
const {
  ForbiddenError,
  UnauthorizedError,
  BadRequestError,
} = require('../utils/errors');
const asyncHandler = require('../utils/async');

const requirePlatformPermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasPermission = await PermissionService.hasPlatformPermission(
      req.user.userId,
      permissionName
    );

    if (!hasPermission) {
      throw new ForbiddenError(
        `Insufficient platform permissions: requires ${permissionName}`
      );
    }

    next();
  });
};

const requireStorePermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const { storeId } = req.params;
    if (!storeId) {
      throw new BadRequestError(
        'Store ID parameter is missing from route path'
      );
    }

    const hasPermission = await PermissionService.hasStorePermission(
      req.user.userId,
      storeId,
      permissionName
    );

    if (!hasPermission) {
      throw new ForbiddenError(
        `Insufficient store permissions: requires ${permissionName}`
      );
    }

    next();
  });
};

module.exports = {
  requirePlatformPermission,
  requireStorePermission,
};
