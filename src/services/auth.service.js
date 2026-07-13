const UserRepository = require('../repositories/user.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ConflictError, UnauthorizedError } = require('../utils/errors');

class AuthService {
  async register({ email, username, password }) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await UserRepository.create({
      email,
      username,
      password: hashedPassword,
    });

    // Omit password from returned user object
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User profile not found or inactive');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
