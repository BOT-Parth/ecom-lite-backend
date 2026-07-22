/**
 * Layer:      Repository
 * 
 * Purpose:
 * Encapsulates all Prisma database operations for the Customer model.
 */

const { prisma } = require('../config/prisma');

class CustomerRepository {
  /**
   * Create a new customer record.
   */
  async create(customerData) {
    return await prisma.customer.create({
      data: customerData,
    });
  }

  /**
   * Find a customer by email within a specific store context.
   */
  async findByEmailAndStore(email, storeId) {
    return await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId,
          email,
        },
      },
    });
  }

  /**
   * Find a customer by their unique ID.
   */
  async findById(id) {
    return await prisma.customer.findUnique({
      where: { id },
    });
  }

  /**
   * Check if a customer exists by ID.
   */
  async exists(id) {
    const count = await prisma.customer.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Find all customers for a specific store.
   */
  async findByStore(storeId) {
    return await prisma.customer.findMany({
      where: { storeId },
    });
  }

  /**
   * Update a customer's record.
   */
  async update(id, data) {
    return await prisma.customer.update({
      where: { id },
      data,
    });
  }
}

module.exports = new CustomerRepository();
