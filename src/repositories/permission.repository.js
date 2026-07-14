/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles all database queries for platform and store permission resolution.
 * Extracted from PermissionService so that all Prisma queries live in the
 * repository layer, keeping services free of direct ORM calls.
 *
 * Called By:
 * src/services/permission.service.js
 *
 * Calls:
 * src/config/prisma.js  (Prisma client)
 *
 * Request Flow:
 * rbac.middleware.js
 *   → permission.service.js
 *   → permission.repository.js
 *   → Prisma → PostgreSQL
 */

const { prisma } = require('../config/prisma');

class PermissionRepository {
  /**
   * Returns the count of active platform role records for a given user that
   * include the requested permission name.
   */
  async countPlatformPermission(userId, permissionName) {
    return prisma.userPlatformRole.count({
      where: {
        userId,
        user: { isActive: true },
        role: {
          platformRolePermissions: {
            some: {
              permission: { name: permissionName },
            },
          },
        },
      },
    });
  }

  /**
   * Returns the count of active store membership records for a given user
   * and store that include the requested permission name.
   */
  async countStorePermission(userId, storeId, permissionName) {
    return prisma.userStoreMembership.count({
      where: {
        userId,
        storeId,
        user: { isActive: true },
        role: {
          storeRolePermissions: {
            some: {
              permission: { name: permissionName },
            },
          },
        },
      },
    });
  }
}

module.exports = new PermissionRepository();
