/**
 * Layer:      Application Bootstrap
 *
 * Purpose:
 * Creates and configures the Express application instance.
 * Registers global middleware (CORS, JSON body parser) and mounts all API
 * routes. Attaches the global error handler as the final middleware.
 *
 * Called By:
 * src/server.js  (imports app and calls app.listen)
 *
 * Calls:
 * src/routes/index.js          (all API routes)
 * src/middleware/error.middleware.js  (global error handler)
 *
 * Request Flow:
 * HTTP Request
 *   → app.js  (cors, express.json)
 *   → routes/index.js
 *   → [feature router] → [middleware chain] → controller → service → repo → Prisma
 *   → error.middleware.js  (on error)
 *   → HTTP Response
 */

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/', routes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
