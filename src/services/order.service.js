/**
 * Layer:      Service
 *
 * Purpose:
 * Contains the business logic for customer orders. Handles product validation,
 * inventory checks, duplicate merging, total calculation, and status transitions.
 */

const OrderRepository = require('../repositories/order.repository');

class OrderService {
  /**
   * Merges duplicate product IDs in the request by summing their quantities.
   */
  _mergeDuplicateItems(items) {
    const merged = {};
    for (const item of items) {
      if (!merged[item.productId]) {
        merged[item.productId] = { ...item };
      } else {
        merged[item.productId].quantity += item.quantity;
      }
    }
    return Object.values(merged);
  }

  /**
   * Places a new order, enforcing inventory limits and locking items into a snapshot.
   */
  async placeOrder(storeId, orderData) {
    // 1. Merge duplicate productIds
    const mergedItems = this._mergeDuplicateItems(orderData.items);
    const productIds = mergedItems.map((item) => item.productId);

    // 2. Fetch products and their current inventory
    const products = await OrderRepository.getProductsWithInventory(storeId, productIds);
    const productMap = {};
    for (const p of products) {
      productMap[p.id] = p;
    }

    // 3. Validate availability and sufficient stock for ALL items
    const errors = [];
    const validatedItemsData = [];

    for (const item of mergedItems) {
      const product = productMap[item.productId];
      
      if (!product) {
        errors.push({
          productId: item.productId,
          productName: 'Unknown Product',
          requestedQuantity: item.quantity,
          availableQuantity: 0,
          reason: 'Product does not exist or does not belong to this store.',
        });
        continue;
      }

      const availableQuantity = product.inventory ? product.inventory.quantity : 0;

      if (availableQuantity < item.quantity) {
        errors.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity,
          reason: 'Insufficient stock',
        });
      } else {
        // Prepare snapshotted item data
        validatedItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price, // Snapshot current price
        });
      }
    }

    // 4. Reject if any product fails validation
    if (errors.length > 0) {
      const error = new Error('Some products do not have sufficient stock.');
      error.details = { items: errors };
      error.status = 400; // Bad Request
      throw error;
    }

    // 5. Create order and decrement inventory in a single transaction
    return OrderRepository.createOrderWithInventoryUpdate(storeId, orderData, validatedItemsData);
  }

  /**
   * Tracks guest orders by email and phone for a specific store.
   */
  async trackOrders(storeId, email, phone) {
    return OrderRepository.trackOrders(storeId, email, phone);
  }

  /**
   * Lists all orders for a store (Store Staff).
   */
  async listStoreOrders(storeId) {
    return OrderRepository.listStoreOrders(storeId);
  }

  /**
   * Gets order details (Store Staff).
   */
  async getOrderDetails(storeId, orderId) {
    const order = await OrderRepository.getOrderByIdAndStore(orderId, storeId);
    if (!order) {
      const error = new Error('Order not found or does not belong to this store.');
      error.status = 404;
      throw error;
    }
    // Tenant scoping check
    if (order.storeId !== storeId) {
      const error = new Error('Order not found.');
      error.status = 404;
      throw error;
    }
    return order;
  }

  /**
   * Updates an order's status, enforcing transition rules.
   */
  async updateOrderStatus(storeId, orderId, newStatus) {
    const order = await this.getOrderDetails(storeId, orderId);

    const currentStatus = order.status;

    // Idempotency check for CANCELLED
    if (currentStatus === 'CANCELLED' && newStatus === 'CANCELLED') {
      const error = new Error('Order is already cancelled.');
      error.status = 400;
      throw error;
    }

    // Terminal states cannot be changed
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
      const error = new Error(`Order is in terminal state '${currentStatus}' and cannot be changed.`);
      error.status = 400;
      throw error;
    }

    // Enforce forward-only flow for normal transitions
    const flow = {
      'PLACED': ['PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'],
      'PROCESSING': ['READY', 'COMPLETED', 'CANCELLED'],
      'READY': ['COMPLETED', 'CANCELLED']
    };

    const allowed = flow[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      const error = new Error(`Cannot transition order from '${currentStatus}' to '${newStatus}'.`);
      error.status = 400;
      throw error;
    }

    return OrderRepository.updateOrderStatus(order, newStatus);
  }
}

module.exports = new OrderService();
