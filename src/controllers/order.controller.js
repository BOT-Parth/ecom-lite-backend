/**
 * Layer:      Controller
 *
 * Purpose:
 * HTTP handler for customer orders. Receives requests, passes to service layer,
 * formats and sanitizes responses.
 */

const OrderService = require('../services/order.service');



class OrderController {
  /**
   * Public: Place an order.
   */
  async placeOrder(req, res, next) {
    try {
      const { storeId } = req.params;
      const orderData = req.body;
      const customerId = req.customer.id; // Injected by authenticateCustomer
      const order = await OrderService.placeOrder(storeId, customerId, orderData);
      
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Protected: List all customer's orders (Customer).
   */
  async listCustomerOrders(req, res, next) {
    try {
      const { storeId } = req.params;
      const customerId = req.customer.id;
      const orders = await OrderService.getCustomerOrders(storeId, customerId);
      
      res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Protected: Get specific order details (Customer).
   */
  async getCustomerOrder(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const customerId = req.customer.id;
      const order = await OrderService.getCustomerOrderDetails(storeId, customerId, id);
      
      res.status(200).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Protected: List all store orders (Store Staff).
   */
  async listOrders(req, res, next) {
    try {
      const { storeId } = req.params;
      const orders = await OrderService.listStoreOrders(storeId);
      
      res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Protected: Get specific order details (Store Staff).
   */
  async getOrder(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const order = await OrderService.getOrderDetails(storeId, id);
      
      res.status(200).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Protected: Update order status (Store Staff).
   */
  async updateStatus(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const { status } = req.body;
      const order = await OrderService.updateOrderStatus(storeId, id, status);
      
      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
