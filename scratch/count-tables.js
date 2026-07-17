require('dotenv').config();
const { prisma } = require('../src/config/prisma');

async function runCounts() {
  try {
    const counts = {
      Inventory: await prisma.inventory.count(),
      Product: await prisma.product.count(),
      Category: await prisma.category.count(),
      UserStoreMembership: await prisma.userStoreMembership.count(),
      StoreRequest: await prisma.storeRequest.count(),
      Store: await prisma.store.count(),
      UserPlatformRole: await prisma.userPlatformRole.count(),
      User: await prisma.user.count(),
      PlatformRole: await prisma.platformRole.count(),
      PlatformPermission: await prisma.platformPermission.count(),
      PlatformRolePermission: await prisma.platformRolePermission.count(),
      StoreRole: await prisma.storeRole.count(),
      StorePermission: await prisma.storePermission.count(),
      StoreRolePermission: await prisma.storeRolePermission.count()
    };
    
    console.log("--- TABLE COUNTS ---");
    console.table(counts);

    // Identify SUPER_ADMIN
    console.log("\n--- SUPER_ADMIN ACCOUNTS ---");
    const superAdmins = await prisma.user.findMany({
      where: {
        userPlatformRoles: {
          some: {
            role: {
              name: 'SUPER_ADMIN'
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    console.log(JSON.stringify(superAdmins, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runCounts();
