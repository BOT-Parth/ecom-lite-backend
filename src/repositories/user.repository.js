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
