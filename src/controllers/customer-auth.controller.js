/**
 * Layer:      Controller
 * 
 * Purpose:
 * HTTP handlers for customer authentication endpoints.
 * Interacts with the CustomerAuthService and formats responses.
 */

const CustomerAuthService = require('../services/customer-auth.service');

class CustomerAuthController {
  /**
   * Public: Register a new customer.
   */
  async register(req, res, next) {
    try {
      const { storeId } = req.params;
      const customer = await CustomerAuthService.register(storeId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Customer registered successfully',
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: Login customer.
   */
  async login(req, res, next) {
    try {
      const { storeId } = req.params;
      const { email, password } = req.body;
      const { token, customer } = await CustomerAuthService.login(storeId, email, password);
      
      res.status(200).json({
        success: true,
        message: 'Customer logged in successfully',
        data: { token, customer },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: Logout customer (stub).
   * Since we use stateless JWTs, logout is typically handled client-side by destroying the token.
   */
  async logout(req, res, next) {
    try {
      // Future-proofing for potential token invalidation / blocklists
      res.status(200).json({
        success: true,
        message: 'Customer logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Protected: Get authenticated customer profile.
   */
  async getProfile(req, res, next) {
    try {
      // req.customer is injected by the authenticateCustomer middleware
      const customerId = req.customer.id;
      const storeId = req.params.storeId;

      const customer = await CustomerAuthService.getProfile(customerId, storeId);
      
      res.status(200).json({
        success: true,
        message: 'Customer profile retrieved successfully',
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerAuthController();
