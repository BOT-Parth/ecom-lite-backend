/**
 * Layer:      Controllers
 *
 * Purpose:
 * Receives HTTP requests for health check endpoints.
 *
 * Called By:
 * src/routes/index.js
 */

class HealthController {
  check = (req, res) => {
    return res.status(200).json({
      status: 'ok',
      message: 'up and running',
    });
  };
}

module.exports = new HealthController();
