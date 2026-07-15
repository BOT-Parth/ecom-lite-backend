/**
 * Layer:      Service
 *
 * Purpose:
 * Owns all authentication business logic: user registration (password hashing,
 * duplicate-email check), login (credential verification, JWT generation), and
 * profile retrieval. Passwords are never returned to callers.
 *
 * Both login() and getProfile() return identical user objects enriched with the
 * authorization context (platformRole + storeMemberships). The shared
 * _assembleUserWithAuth() method is the single definition of that shape.
 * This ensures the frontend never needs a follow-up request after login to
 * determine the user's authorization state.
 *
 * Called By:
 * src/controllers/auth.controller.js
 *
 * Calls:
 * src/repositories/user.repository.js
 *   findByEmail     — lightweight credential lookup (login only)
 *   findProfileContext — enriched lookup with platform role + store memberships
 * bcrypt            (password hashing / comparison)
 * jsonwebtoken      (JWT signing)
 * src/utils/errors.js
 *
 * Request Flow:
 * auth.controller.js
 *   → auth.service.js
 *   → user.repository.js (findByEmail for validation, findProfileContext for context)
 *   → Prisma → PostgreSQL
 */

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
    // Step 1 — lightweight lookup to validate credentials without the join overhead
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

    // Step 2 — issue JWT (userId only; authorization data is never in the token)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Step 3 — fetch enriched context after credentials are confirmed valid;
    // the expensive join only runs for authenticated users
    const enrichedUser = await UserRepository.findProfileContext(user.id);
    const userWithAuth = this._assembleUserWithAuth(enrichedUser);

    return {
      token,
      user: userWithAuth,
    };
  }

  async getProfile(userId) {
    const user = await UserRepository.findProfileContext(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User profile not found or inactive');
    }

    return this._assembleUserWithAuth(user);
  }

  /**
   * Assembles the public user object with its authorization context.
   *
   * This is the single definition of the user shape returned by both
   * login() and getProfile(). Any change to the response contract belongs
   * here and propagates to both endpoints automatically.
   *
   * Strips: password, raw userPlatformRoles relation, raw storeMemberships relation.
   * Returns: user scalar fields + authorization.platformRole + authorization.storeMemberships
   */
  _assembleUserWithAuth(user) {
    // A user may hold at most one platform role; null when none is assigned.
    const platformRole =
      user.userPlatformRoles.length > 0
        ? user.userPlatformRoles[0].role.name
        : null;

    // Only the fields the frontend needs for role-aware UI rendering.
    // Permission names are deliberately excluded — enforcement is backend-only
    // via RBAC middleware.
    const storeMemberships = user.storeMemberships.map((membership) => ({
      storeId: membership.store.id,
      storeName: membership.store.name,
      storeSlug: membership.store.slug,
      roleName: membership.role.name,
    }));

    // Strip Prisma relation fields and the password hash before returning.
    const {
      password: _,
      userPlatformRoles: __,
      storeMemberships: ___,
      ...userFields
    } = user;

    return {
      ...userFields,
      authorization: {
        platformRole,
        storeMemberships,
      },
    };
  }
}

module.exports = new AuthService();
