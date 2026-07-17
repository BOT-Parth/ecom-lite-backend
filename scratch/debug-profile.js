require('dotenv').config();
const { prisma } = require('../src/config/prisma');
const AuthService = require('../src/services/auth.service');

async function debug() {
  try {
    // Find all users with memberships
    const users = await prisma.user.findMany({
      where: {
        storeMemberships: {
          some: {}
        }
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    console.log("--- Users with memberships ---");
    for (const u of users) {
      const profile = await AuthService.getProfile(u.id);
      console.log(`User: ${u.username} (${u.email})`);
      console.log(JSON.stringify(profile, null, 2));
      console.log("----------------------------");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
