/**
 * Layer:      Service
 * 
 * Purpose:
 * Core business logic for customer authentication, handling password hashing,
 * verifying credentials, issuing JWTs, and assembling profile responses.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const CustomerRepository = require('../repositories/customer.repository');

class CustomerAuthService {
  /**
   * Register a new customer for a specific store.
   */
  async register(storeId, data) {
    const existingCustomer = await CustomerRepository.findByEmailAndStore(data.email, storeId);
    if (existingCustomer) {
      throw new BadRequestError('Email already registered for this store');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const newCustomer = await CustomerRepository.create({
      storeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
    });

    // Return the safe profile
    return this._formatProfile(newCustomer);
  }

  /**
   * Authenticate a customer and issue a JWT token.
   */
  async login(storeId, email, password) {
    const customer = await CustomerRepository.findByEmailAndStore(email, storeId);
    if (!customer || !customer.isActive) {
      // Use generic error for enumeration prevention
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT specific to customer
    const token = jwt.sign(
      { customerId: customer.id, storeId: customer.storeId, type: 'customer' },
      env.CUSTOMER_JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } // Reusing standard duration for MVP
    );

    return {
      token,
      customer: this._formatProfile(customer),
    };
  }

  /**
   * Retrieve customer profile.
   */
  async getProfile(customerId, storeId) {
    const customer = await CustomerRepository.findById(customerId);
    if (!customer || customer.storeId !== storeId) {
      throw new NotFoundError('Customer not found');
    }

    return this._formatProfile(customer);
  }

  /**
   * Verify customer exists.
   */
  async verifyCustomer(customerId) {
    const exists = await CustomerRepository.exists(customerId);
    if (!exists) {
      throw new NotFoundError('Customer not found');
    }
    return true;
  }

  /**
   * Helper: Strip sensitive information (e.g. password) from the customer model
   */
  _formatProfile(customer) {
    const { password, ...safeProfile } = customer;
    return safeProfile;
  }
}

module.exports = new CustomerAuthService();
