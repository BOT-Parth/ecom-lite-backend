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
      const order = await OrderService.placeOrder(storeId, orderData);
      
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
   * Best-effort masking of delivery address.
   */
  _maskAddress(address) {
    if (!address) return '***';
    // Split by comma and filter out any parts containing numbers (street numbers, zip codes)
    const safeParts = address.split(',').filter(p => !/\d/.test(p));
    
    if (safeParts.length > 0) {
      // Take up to the last 2 safe parts (likely City, Region)
      return safeParts.slice(-2).map(p => p.trim()).join(', ');
    }
    
    return '***';
  }

  /**
   * Public: Track guest orders.
   */
  async trackOrders(req, res, next) {
    try {
      const { storeId } = req.params;
      const { email, phone } = req.body;
      const orders = await OrderService.trackOrders(storeId, email, phone);
      
      // Mask delivery address to protect PII
      const sanitizedOrders = orders.map((o) => {
        const oObj = { ...o };
        // Strip exact address and PII
        delete oObj.customerEmail;
        delete oObj.customerPhone;
        oObj.maskedDeliveryAddress = this._maskAddress(oObj.deliveryAddress);
        delete oObj.deliveryAddress;
        delete oObj.customerName; // Protect customer name as well
        return oObj;
      });

      res.status(200).json({
        success: true,
        data: { orders: sanitizedOrders },
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
