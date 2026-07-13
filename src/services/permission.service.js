const { prisma } = require('../config/prisma');

class PermissionService {
  async hasPlatformPermission(userId, permissionName) {
    if (!userId || !permissionName) return false;

    const count = await prisma.userPlatformRole.count({
      where: {
        userId,
        user: {
          isActive: true,
        },
        role: {
          platformRolePermissions: {
            some: {
              permission: {
                name: permissionName,
              },
            },
          },
        },
      },
    });

    return count > 0;
  }

  async hasStorePermission(userId, storeId, permissionName) {
    if (!userId || !storeId || !permissionName) return false;

    const count = await prisma.userStoreMembership.count({
      where: {
        userId,
        storeId,
        user: {
          isActive: true,
        },
        role: {
          storeRolePermissions: {
            some: {
              permission: {
                name: permissionName,
              },
            },
          },
        },
      },
    });

    return count > 0;
  }
}

module.exports = new PermissionService();
