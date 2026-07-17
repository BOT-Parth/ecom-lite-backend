require('dotenv').config();
const { prisma } = require('../src/config/prisma');

async function executeCleanup() {
  const superAdminId = 'f8aac2ee-c7c5-4042-a566-5b183d574d12';

  try {
    console.log("Starting DB Cleanup...");

    const delInventory = await prisma.inventory.deleteMany({});
    console.log(`Cleared Inventory: ${delInventory.count} rows deleted.`);

    const delProduct = await prisma.product.deleteMany({});
    console.log(`Cleared Product: ${delProduct.count} rows deleted.`);

    const delCategory = await prisma.category.deleteMany({});
    console.log(`Cleared Category: ${delCategory.count} rows deleted.`);

    const delMembership = await prisma.userStoreMembership.deleteMany({});
    console.log(`Cleared UserStoreMembership: ${delMembership.count} rows deleted.`);

    const delStoreRequest = await prisma.storeRequest.deleteMany({});
    console.log(`Cleared StoreRequest: ${delStoreRequest.count} rows deleted.`);

    const delStore = await prisma.store.deleteMany({});
    console.log(`Cleared Store: ${delStore.count} rows deleted.`);

    const delPlatformRole = await prisma.userPlatformRole.deleteMany({
      where: {
        userId: {
          not: superAdminId
        }
      }
    });
    console.log(`Cleared UserPlatformRole (except SUPER_ADMIN): ${delPlatformRole.count} rows deleted.`);

    const delUser = await prisma.user.deleteMany({
      where: {
        id: {
          not: superAdminId
        }
      }
    });
    console.log(`Cleared User (except SUPER_ADMIN): ${delUser.count} rows deleted.`);

    console.log("DB Cleanup completed successfully.");
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

executeCleanup();
