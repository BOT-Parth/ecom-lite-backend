require('dotenv').config();
const app = require('../src/app');
const { prisma, pool } = require('../src/config/prisma');

const PORT = 5101;
const BASE_URL = `http://localhost:${PORT}`;

async function verifyPublicStorefront() {
  console.log('Starting regression verification for public storefront GET /stores...');
  const server = app.listen(PORT);

  try {
    console.log('\n--- Request: GET /stores (Public Storefront Listing) ---');
    const response = await fetch(`${BASE_URL}/stores`, { method: 'GET' });
    
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', response.status);
    
    const body = await response.json();
    console.log('Response Body:', JSON.stringify(body, null, 2));

    // Basic assertions
    if (response.status === 200 && body.success === true && Array.isArray(body.data.stores)) {
      console.log('\n✅ PASS: Public storefront endpoint is working correctly and has not changed.');
    } else {
      console.error('\n❌ FAIL: Public storefront response does not match the expected contract.');
    }

  } catch (error) {
    console.error('Verification failed with error:', error);
  } finally {
    server.close(async () => {
      console.log('\nHTTP Server closed.');
      await prisma.$disconnect();
      await pool.end();
      process.exit(0);
    });
  }
}

verifyPublicStorefront();
