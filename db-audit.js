const { prisma, pool } = require('./src/config/prisma');

async function audit() {
  console.log('--- DATABASE INTEGRITY AUDIT ---');

  const requests = await prisma.storeRequest.findMany();
  const stores = await prisma.store.findMany({ include: { memberships: { include: { role: true } } } });
  const memberships = await prisma.userStoreMembership.findMany({ include: { role: true, store: true } });

  let orphanedRequests = 0;
  let ownerlessStores = 0;
  let orphanedMemberships = 0;
  let multipleOwnerships = 0;

  // 1. Orphaned Approved Requests (Approved but no valid store)
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  for (const req of approvedRequests) {
    if (!req.storeId) {
      console.log(`[ORPHAN REQUEST] Request ${req.id} (slug: ${req.slug}) is APPROVED but has storeId=null`);
      orphanedRequests++;
    } else {
      const storeExists = stores.some(s => s.id === req.storeId);
      if (!storeExists) {
        console.log(`[ORPHAN REQUEST] Request ${req.id} references non-existent store ${req.storeId}`);
        orphanedRequests++;
      }
    }
  }

  // 2. Duplicate approved requests for a single user
  const requestCountByUser = {};
  for (const r of approvedRequests) {
    if (!requestCountByUser[r.userId]) requestCountByUser[r.userId] = [];
    requestCountByUser[r.userId].push(r);
  }
  for (const [userId, reqs] of Object.entries(requestCountByUser)) {
    if (reqs.length > 1) {
      console.log(`[DUPLICATE REQUESTS] User ${userId} has ${reqs.length} approved store requests.`);
    }
  }

  // 3. Ownerless Stores
  for (const store of stores) {
    const owners = store.memberships.filter(m => m.role.name === 'STORE_OWNER');
    if (owners.length === 0) {
      console.log(`[OWNERLESS STORE] Store ${store.id} (${store.name}) has no STORE_OWNER.`);
      ownerlessStores++;
    } else if (owners.length > 1) {
      console.log(`[DUPLICATE OWNERSHIP] Store ${store.id} has ${owners.length} owners.`);
    }
  }

  // 4. Duplicate Ownerships (User owns multiple stores)
  const ownerCountByUser = {};
  for (const m of memberships) {
    if (m.role.name === 'STORE_OWNER') {
      if (!ownerCountByUser[m.userId]) ownerCountByUser[m.userId] = [];
      ownerCountByUser[m.userId].push(m);
    }
  }
  for (const [userId, mems] of Object.entries(ownerCountByUser)) {
    if (mems.length > 1) {
      console.log(`[MULTIPLE OWNERSHIPS] User ${userId} owns ${mems.length} stores.`);
      multipleOwnerships++;
    }
  }

  // 5. Orphaned Memberships (References deleted store) - Prisma foreign keys usually prevent this, but we'll check
  for (const m of memberships) {
    const storeExists = stores.some(s => s.id === m.storeId);
    if (!storeExists) {
      console.log(`[ORPHAN MEMBERSHIP] Membership ${m.id} references non-existent store ${m.storeId}`);
      orphanedMemberships++;
    }
  }

  console.log(`\nSummary:
Orphaned Requests: ${orphanedRequests}
Ownerless Stores: ${ownerlessStores}
Orphaned Memberships: ${orphanedMemberships}
Multiple Ownerships: ${multipleOwnerships}`);

  await prisma.$disconnect();
  await pool.end();
}

audit().catch(console.error);
