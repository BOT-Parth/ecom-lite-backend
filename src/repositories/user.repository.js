/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles all database operations for the User model.
 * This is the only file that queries the user Prisma model directly.
 *
 * findById — lightweight lookup by ID (login, auth checks).
 * findByEmail — lookup by email (login).
 * findProfileContext — enriched query that includes platform role and store
 *   memberships. Used exclusively by AuthService.getProfile() to assemble
 *   the authenticated profile response with authorization context.
 *
 * Called By:
 * src/services/auth.service.js
 *
 * Calls:
 * src/config/prisma.js  (Prisma client)
 *
 * Request Flow:
 * auth.service.js
 *   → user.repository.js
 *   → Prisma → PostgreSQL
 */

const { prisma } = require('../config/prisma');

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Fetches the user record together with their platform role and all store
   * memberships (store details + role name). This is the dedicated query for
   * assembling the authenticated profile authorization context.
   *
   * Returns null if the user does not exist.
   */
  async findProfileContext(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        userPlatformRoles: {
          include: {
            role: {
              select: { name: true },
            },
          },
        },
        storeMemberships: {
          include: {
            store: {
              select: { id: true, name: true, slug: true },
            },
            role: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async create({ email, username, password }) {
    return prisma.user.create({
      data: {
        email,
        username,
        password,
        isActive: true,
      },
    });
  }
}

module.exports = new UserRepository();
