/**
 * Layer:      Config
 *
 * Purpose:
 * Initialises and exports the Prisma client configured with the pg adapter
 * for direct PostgreSQL connectivity. Also exports the pg Pool so server.js
 * can close it during graceful shutdown.
 *
 * Called By:
 * All repository files that require direct database access.
 * src/server.js  (pool, for graceful shutdown)
 *
 * Calls:
 * PostgreSQL  (via DATABASE_URL environment variable)
 *
 * Architecture note:
 * Only this file should construct the PrismaClient. All repositories import
 * the singleton instance exported here.
 */

const { PrismaClient } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = { prisma, pool };
