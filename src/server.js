/**
 * Layer:      Server Entry Point
 *
 * Purpose:
 * Starts the HTTP server and binds it to the configured port.
 * Handles graceful shutdown on SIGTERM and SIGINT signals, closing the
 * HTTP server and the PostgreSQL connection pool cleanly.
 *
 * Called By:
 * npm start / node src/server.js  (process entry point)
 *
 * Calls:
 * src/app.js              (Express application)
 * src/config/prisma.js    (PostgreSQL pool — for shutdown)
 */

require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/prisma');

const env = require('./config/env');
const PORT = env.PORT;

const http = require('http');

const server = http.createServer(app);

server.on('error', (err) => {
  console.error(`Failed to start server on port ${PORT}:`, err.message);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    process.exit(0);
  });
});
