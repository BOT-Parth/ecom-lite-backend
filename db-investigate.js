const { prisma, pool } = require('./src/config/prisma');

async function run() {
  const userId = '2ba28862-c520-4780-be41-6c68f66465b1';
  
  console.log('--- USER DATA ---');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      storeRequests: true,
      storeMemberships: {
        include: { store: true, role: true }
      }
    }
  });
  console.dir(user, { depth: null });
  
  console.log('\n--- ALL STORES ---');
  const allStores = await prisma.store.findMany();
  console.dir(allStores, { depth: null });
  
  await prisma.$disconnect();
  await pool.end();
}
run().catch(console.error);
