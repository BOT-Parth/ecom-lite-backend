const { prisma, pool } = require('./src/config/prisma');

async function run() {
  const stores = await prisma.store.count();
  const approvedRequests = await prisma.storeRequest.count({ where: { status: 'APPROVED' } });
  
  console.log(`Actual Stores in DB: ${stores}`);
  console.log(`Approved Requests in DB: ${approvedRequests}`);

  await prisma.$disconnect();
  await pool.end();
}
run().catch(console.error);
