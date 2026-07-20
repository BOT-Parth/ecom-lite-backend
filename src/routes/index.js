/**
 * Layer:      Routes
 *
 * Purpose:
 * Root router that mounts all feature routers onto their base paths.
 * This is the single entry point for all API routes in the application.
 *
 * Called By:
 * src/app.js  (mounted at /)
 *
 * Calls:
 * src/routes/auth.routes.js
 * src/routes/store-request.routes.js
 * src/routes/store.routes.js
 * src/routes/category.routes.js
 * src/routes/product.routes.js
 * src/routes/inventory.routes.js
 *
 * Request Flow:
 * Client → app.js → routes/index.js → [feature router]
 */

const express = require("express");
const authRoutes = require("./auth.routes");
const storeRequestRoutes = require("./store-request.routes");
const storeRoutes = require("./store.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const inventoryRoutes = require("./inventory.routes");
const orderRoutes = require("./order.routes");

const router = express.Router();

const HealthController = require("../controllers/health.controller");

// Health check endpoint
router.get("/health", HealthController.check);

router.use("/auth", authRoutes);
router.use("/store-requests", storeRequestRoutes);
router.use("/stores", storeRoutes);
router.use("/stores/:storeId/categories", categoryRoutes);
router.use("/stores/:storeId/products", productRoutes);
router.use("/stores/:storeId/products/:productId/inventory", inventoryRoutes);
router.use("/stores/:storeId/orders", orderRoutes);

module.exports = router;
