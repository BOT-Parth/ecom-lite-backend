/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles all database operations for the User model.
 * This is the only file that queries the user Prisma model directly.
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
