/**
 * Layer:      Service
 *
 * Purpose:
 * Resolves platform and store permission checks by querying the database
 * via PermissionRepository. Used exclusively by the RBAC middleware.
 *
 * Called By:
 * src/middleware/rbac.middleware.js
 *
 * Calls:
 * src/repositories/permission.repository.js
 *
 * Request Flow:
 * rbac.middleware.js
 *   → permission.service.js
 *   → permission.repository.js
 *   → Prisma → PostgreSQL
 */

const PermissionRepository = require('../repositories/permission.repository');

class PermissionService {
  async hasPlatformPermission(userId, permissionName) {
    if (!userId || !permissionName) return false;

    const count = await PermissionRepository.countPlatformPermission(
      userId,
      permissionName
    );

    return count > 0;
  }

  async hasStorePermission(userId, storeId, permissionName) {
    if (!userId || !storeId || !permissionName) return false;

    // Platform permissions cannot be used to access store‑scoped resources
    if (permissionName === 'APPROVE_STORE' || permissionName === 'CREATE_STORE') {
      return false;
    }

    // Platform administrators bypass store-level membership permission checks
    const isPlatformAdmin = await this.hasPlatformPermission(userId, 'APPROVE_STORE');
    if (isPlatformAdmin) {
      return true;
    }

    const count = await PermissionRepository.countStorePermission(
      userId,
      storeId,
      permissionName
    );

    return count > 0;
  }
}

module.exports = new PermissionService();
