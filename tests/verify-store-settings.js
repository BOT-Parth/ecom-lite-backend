require('dotenv').config();
const app = require('../src/app');
const { prisma, pool } = require('../src/config/prisma');

const PORT = 5110;
const BASE_URL = `http://localhost:${PORT}`;

async function runVerification() {
  console.log('Starting HTTP endpoint verification for Store Settings (Milestone 5)...');
  const server = app.listen(PORT);

  let adminToken, ownerAToken, ownerBToken, userToken;
  let storeAId, storeBId;

  try {
    // 1. Authenticate users and retrieve tokens
    console.log('\n--- Authenticating ---');
    
    // Platform Admin (SUPER_ADMIN)
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
      }),
    });
    const adminLogin = await adminLoginRes.json();
    adminToken = adminLogin.data.token;
    console.log('SUPER_ADMIN token resolved');

    // Create & Authenticate Owner A
    const ownerAEmail = `owner_a_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerAEmail, username: 'ownera', password: 'password123' }),
    });
    const ownerALoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerAEmail, password: 'password123' }),
    });
    ownerAToken = (await ownerALoginRes.json()).data.token;
    console.log('Owner A token resolved');

    // Create & Authenticate Owner B
    const ownerBEmail = `owner_b_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerBEmail, username: 'ownerb', password: 'password123' }),
    });
    const ownerBLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerBEmail, password: 'password123' }),
    });
    ownerBToken = (await ownerBLoginRes.json()).data.token;
    console.log('Owner B token resolved');

    // Create & Authenticate Regular User
    const userEmail = `regular_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, username: 'regularuser', password: 'password123' }),
    });
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: 'password123' }),
    });
    userToken = (await userLoginRes.json()).data.token;
    console.log('Regular User token resolved');

    // Create Store requests and approve them
    console.log('\n--- Setup Stores ---');
    const reqA = await fetch(`${BASE_URL}/store-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerAToken}` },
      body: JSON.stringify({ name: 'Store A', slug: `store-a-${Date.now()}`, description: 'Description A', avatarUrl: 'https://example.com/a.png' }),
    });
    const reqABody = await reqA.json();
    const reqAId = reqABody.data.request.id;

    const approveA = await fetch(`${BASE_URL}/store-requests/${reqAId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    storeAId = (await approveA.json()).data.store.id;
    console.log(`Store A created: ${storeAId}`);

    const reqB = await fetch(`${BASE_URL}/store-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerBToken}` },
      body: JSON.stringify({ name: 'Store B', slug: `store-b-${Date.now()}`, description: 'Description B', avatarUrl: 'https://example.com/b.png' }),
    });
    const reqBBody = await reqB.json();
    const reqBId = reqBBody.data.request.id;

    const approveB = await fetch(`${BASE_URL}/store-requests/${reqBId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    storeBId = (await approveB.json()).data.store.id;
    console.log(`Store B created: ${storeBId}`);

    // --- Verification Tests ---
    console.log('\n--- [Test 1] GET Store Settings (STORE_OWNER - Authorized) ---');
    const getSettingsRes = await fetch(`${BASE_URL}/stores/${storeAId}/settings`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerAToken}` },
    });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', getSettingsRes.status);
    console.log('Settings Payload:', JSON.stringify(await getSettingsRes.json(), null, 2));

    console.log('\n--- [Test 2] PATCH Store Settings (STORE_OWNER - Authorized) ---');
    const patchSettingsRes = await fetch(`${BASE_URL}/stores/${storeAId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerAToken}` },
      body: JSON.stringify({
        name: 'Store A Updated',
        description: 'New Description A',
        avatarUrl: 'https://example.com/a-updated.png',
      }),
    });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', patchSettingsRes.status);
    console.log('Updated Settings Payload:', JSON.stringify(await patchSettingsRes.json(), null, 2));

    console.log('\n--- [Test 3] GET Store Settings (SUPER_ADMIN Bypass - Authorized) ---');
    const getAdminRes = await fetch(`${BASE_URL}/stores/${storeAId}/settings`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', getAdminRes.status);
    console.log('Response:', JSON.stringify(await getAdminRes.json(), null, 2));

    console.log('\n--- [Test 4] PATCH Store Settings (SUPER_ADMIN Bypass - Authorized) ---');
    const patchAdminRes = await fetch(`${BASE_URL}/stores/${storeAId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Store A Admin Mod',
        description: 'Admin Description',
        avatarUrl: 'https://example.com/admin.png',
      }),
    });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', patchAdminRes.status);
    console.log('Response:', JSON.stringify(await patchAdminRes.json(), null, 2));

    console.log('\n--- [Test 5] GET Store Settings (Unauthorized User - No Token) ---');
    const noTokenRes = await fetch(`${BASE_URL}/stores/${storeAId}/settings`, { method: 'GET' });
    console.log('Expected Status Code: 401');
    console.log('Actual Status Code:', noTokenRes.status);

    console.log('\n--- [Test 6] GET Store Settings (Cross-Store Access - Owner B accessing Store A) ---');
    const crossStoreRes = await fetch(`${BASE_URL}/stores/${storeAId}/settings`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerBToken}` },
    });
    console.log('Expected Status Code: 403');
    console.log('Actual Status Code:', crossStoreRes.status);
    console.log('Response:', JSON.stringify(await crossStoreRes.json(), null, 2));

    console.log('\n--- [Test 7] GET Store Settings (Regular User - No Membership) ---');
    const regularUserRes = await fetch(`${BASE_URL}/stores/${storeAId}/settings`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('Expected Status Code: 403');
    console.log('Actual Status Code:', regularUserRes.status);

    console.log('\n--- [Test 8] PATCH Store Settings (Validation Error - Too Long Name) ---');
    const invalidPatchRes = await fetch(`${BASE_URL}/stores/${storeAId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerAToken}` },
      body: JSON.stringify({
        name: 'S'.repeat(101),
        description: 'valid description',
      }),
    });
    console.log('Expected Status Code: 400');
    console.log('Actual Status Code:', invalidPatchRes.status);
    console.log('Response:', JSON.stringify(await invalidPatchRes.json(), null, 2));

    console.log('\n--- [Test 9] Verify Public Storefront GET /stores still works ---');
    const publicRes = await fetch(`${BASE_URL}/stores`, { method: 'GET' });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', publicRes.status);

    console.log('\n--- [Test 10] Verify Platform Store Directory GET /stores/platform still works ---');
    const platformRes = await fetch(`${BASE_URL}/stores/platform`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', platformRes.status);

    // Clean up
    console.log('\nCleaning up verification records...');
    await prisma.userStoreMembership.deleteMany({ where: { storeId: { in: [storeAId, storeBId] } } });
    await prisma.storeRequest.deleteMany({ where: { id: { in: [reqAId, reqBId] } } });
    await prisma.store.deleteMany({ where: { id: { in: [storeAId, storeBId] } } });
    await prisma.user.deleteMany({ where: { email: { in: [ownerAEmail, ownerBEmail, userEmail] } } });

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

runVerification();
