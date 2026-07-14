/**
 * Layer:      Middleware
 *
 * Purpose:
 * Provides RBAC (role-based access control) middleware factories.
 * requirePlatformPermission gates platform-level admin operations.
 * requireStorePermission gates store-scoped operations using the storeId
 * path parameter as the sole source of tenant context.
 *
 * Called By:
 * src/routes/store-request.routes.js  (requirePlatformPermission)
 * src/routes/category.routes.js       (requireStorePermission)
 * src/routes/product.routes.js        (requireStorePermission)
 * src/routes/inventory.routes.js      (requireStorePermission)
 *
 * Calls:
 * src/services/permission.service.js
 * src/utils/errors.js
 * src/utils/async.js
 *
 * Request Flow:
 * Route
 *   → rbac.middleware.js
 *   → permission.service.js
 *   → permission.repository.js
 *   → Prisma → PostgreSQL
 *   → allow (next()) or deny (ForbiddenError → error.middleware.js)
 */

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
