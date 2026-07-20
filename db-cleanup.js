const { prisma, pool } = require('./src/config/prisma');

async function cleanup() {
  console.log('--- DATABASE CLEANUP ---');

  // 1. Delete Ownerless Stores
  const stores = await prisma.store.findMany({ include: { memberships: { include: { role: true } } } });
  for (const store of stores) {
    const owners = store.memberships.filter(m => m.role.name === 'STORE_OWNER');
    if (owners.length === 0) {
      console.log(`Deleting ownerless store: ${store.id}`);
      // Cascade delete might be needed if products/categories exist, but this is a test store so let's try direct delete.
      await prisma.store.delete({ where: { id: store.id } });
    }
  }

  // 2. Delete Orphaned Approved Requests
  const requests = await prisma.storeRequest.findMany({ where: { status: 'APPROVED' } });
  for (const req of requests) {
    if (!req.storeId) {
      console.log(`Deleting orphaned request: ${req.id} (slug: ${req.slug})`);
      await prisma.storeRequest.delete({ where: { id: req.id } });
    }
  }

  // 3. Resolve duplicate approved requests per user
  const currentRequests = await prisma.storeRequest.findMany({ where: { status: 'APPROVED' } });
  const requestCountByUser = {};
  for (const r of currentRequests) {
    if (!requestCountByUser[r.userId]) requestCountByUser[r.userId] = [];
    requestCountByUser[r.userId].push(r);
  }
  for (const [userId, reqs] of Object.entries(requestCountByUser)) {
    if (reqs.length > 1) {
      // Keep the most recent one with a valid store, delete the rest
      reqs.sort((a, b) => b.createdAt - a.createdAt);
      for (let i = 1; i < reqs.length; i++) {
        console.log(`Deleting duplicate request: ${reqs[i].id} for user ${userId}`);
        await prisma.storeRequest.delete({ where: { id: reqs[i].id } });
      }
    }
  }
  
  // 4. Resolve multiple ownerships
  const memberships = await prisma.userStoreMembership.findMany({ include: { role: true } });
  const ownerCountByUser = {};
  for (const m of memberships) {
    if (m.role.name === 'STORE_OWNER') {
      if (!ownerCountByUser[m.userId]) ownerCountByUser[m.userId] = [];
      ownerCountByUser[m.userId].push(m);
    }
  }
  for (const [userId, mems] of Object.entries(ownerCountByUser)) {
    if (mems.length > 1) {
      // User owns multiple stores. Delete older stores.
      mems.sort((a, b) => b.createdAt - a.createdAt);
      for (let i = 1; i < mems.length; i++) {
        console.log(`Deleting duplicate store ownership: ${mems[i].storeId} for user ${userId}`);
        await prisma.store.delete({ where: { id: mems[i].storeId } });
        // Associated requests should also be deleted
        await prisma.storeRequest.deleteMany({ where: { storeId: mems[i].storeId } });
      }
    }
  }

  console.log('Cleanup complete.');
  await prisma.$disconnect();
  await pool.end();
}

cleanup().catch(console.error);
