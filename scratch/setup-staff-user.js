require('dotenv').config();
const { prisma } = require('../src/config/prisma');
const AuthService = require('../src/services/auth.service');

async function run() {
  try {
    // Find users and stores
    const user1 = await prisma.user.findFirst({ where: { email: '123456@123456.com' } });
    const user2 = await prisma.user.findFirst({ where: { email: '654321@654321.com' } });
    
    if (!user1 || !user2) {
      console.log("Could not find both users. Please ensure database is seeded.");
      return;
    }

    // Get the store of user2
    const store2Membership = await prisma.userStoreMembership.findFirst({
      where: { userId: user2.id },
      include: { store: true }
    });

    if (!store2Membership) {
      console.log("User 2 has no store. Please create one.");
      return;
    }

    const store2 = store2Membership.store;

    // Get STORE_STAFF role
    const staffRole = await prisma.storeRole.findUnique({
      where: { name: 'STORE_STAFF' }
    });

    // Create staff membership for user1 in store2
    const staffMembership = await prisma.userStoreMembership.upsert({
      where: {
        userId_storeId: {
          userId: user1.id,
          storeId: store2.id
        }
      },
      update: {},
      create: {
        userId: user1.id,
        storeId: store2.id,
        roleId: staffRole.id
      }
    });

    console.log("Created/Verified staff membership:", staffMembership);

    // Now get the profile payload for user1
    const profile = await AuthService.getProfile(user1.id);
    console.log("\n--- USER 1 PROFILE RESPONSE ---");
    console.log(JSON.stringify(profile, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
