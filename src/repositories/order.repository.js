/**
 * Layer:      Repository
 *
 * Purpose:
 * Handles database operations for the Order and OrderItem entities.
 */

const { prisma } = require('../config/prisma');

class OrderRepository {
  /**
   * Generates a globally unique random alphanumeric order number with an ORD- prefix.
   */
  generateOrderNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ORD-${result}`;
  }

  /**
   * Retrieves products belonging to a specific store with their inventory.
   */
  async getProductsWithInventory(storeId, productIds) {
    return prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId,
      },
      include: {
        inventory: true,
      },
    });
  }

  /**
   * Creates an order with items and updates inventory atomically.
   */
  async createOrderWithInventoryUpdate(storeId, orderData, itemsData) {
    // Generate order number and calculate total
    const orderNumber = this.generateOrderNumber();
    const totalAmount = itemsData.reduce((acc, item) => {
      return acc + (Number(item.unitPrice) * item.quantity);
    }, 0);

    return prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          storeId,
          customerId: orderData.customerId,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          deliveryAddress: orderData.deliveryAddress,
          totalAmount,
          items: {
            create: itemsData.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Decrement Inventory for each item
      for (const item of itemsData) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }

      return order;
    });
  }

  /**
   * Finds orders for a specific customer in a store.
   */
  async findCustomerOrders(storeId, customerId) {
    return prisma.order.findMany({
      where: {
        storeId,
        customerId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc', // Newest -> Oldest
      },
    });
  }

  /**
   * Lists all orders for a store.
   */
  async listStoreOrders(storeId) {
    return prisma.order.findMany({
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }, // Usually list is newest first for staff
    });
  }

  /**
   * Gets an order by ID and Store ID.
   */
  async getOrderByIdAndStore(id, storeId) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  /**
   * Updates an order's status. If cancelled, restores inventory atomically.
   */
  async updateOrderStatus(order, newStatus) {
    if (newStatus === 'CANCELLED') {
      return prisma.$transaction(async (tx) => {
        // 1. Update status
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: newStatus },
          include: { items: true },
        });

        // 2. Restore inventory
        for (const item of order.items) {
          if (item.productId) { // Check if product still exists/linked
            await tx.inventory.update({
              where: { productId: item.productId },
              data: {
                quantity: { increment: item.quantity },
              },
            });
          }
        }

        return updatedOrder;
      });
    } else {
      // Normal status update
      return prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus },
        include: { items: true },
      });
    }
  }
}

module.exports = new OrderRepository();
