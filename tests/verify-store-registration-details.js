require('dotenv').config();
const app = require('../src/app');
const { prisma, pool } = require('../src/config/prisma');

const PORT = 5105;
const BASE_URL = `http://localhost:${PORT}`;

async function runVerification() {
  console.log('Starting HTTP endpoint verification for Store Registration Details (Milestone 4)...');
  const server = app.listen(PORT);

  try {
    // 1. Get tokens
    console.log('\n--- Authenticating ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
      }),
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.data.token;
    console.log('SUPER_ADMIN Token resolved successfully');

    const tempUserEmail = `register_user_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tempUserEmail,
        username: 'registeruser',
        password: 'password123',
      }),
    });
    
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tempUserEmail,
        password: 'password123',
      }),
    });
    const userLogin = await userLoginRes.json();
    const userToken = userLogin.data.token;
    console.log('Regular User Token resolved successfully');

    // 2. Valid Store Request (with description and avatarUrl)
    console.log('\n--- [Test 1] Valid Store Request with Rich Metadata ---');
    const validSlug = `valid-rich-store-${Date.now()}`;
    const validRes = await fetch(`${BASE_URL}/store-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Valid Rich Store',
        slug: validSlug,
        description: 'This is a premium electronics and hardware shop.',
        avatarUrl: 'https://example.com/assets/logo.png',
      }),
    });
    console.log('Expected Status Code: 201');
    console.log('Actual Status Code:', validRes.status);
    const validBody = await validRes.json();
    console.log('Response Body:', JSON.stringify(validBody, null, 2));
    const requestId = validBody.data.request.id;

    // 3. Invalid Description (>500 characters)
    console.log('\n--- [Test 2] Invalid Description (> 500 characters) ---');
    const longDescription = 'A'.repeat(501);
    const invalidDescRes = await fetch(`${BASE_URL}/store-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Description Store',
        slug: `invalid-desc-${Date.now()}`,
        description: longDescription,
        avatarUrl: 'https://example.com/logo.png',
      }),
    });
    console.log('Expected Status Code: 400');
    console.log('Actual Status Code:', invalidDescRes.status);
    console.log('Response Body:', JSON.stringify(await invalidDescRes.json(), null, 2));

    // 4. Invalid Avatar Url (>2048 characters)
    console.log('\n--- [Test 3] Invalid Avatar Reference (> 2048 characters) ---');
    const longAvatarUrl = 'B'.repeat(2049);
    const invalidAvatarRes = await fetch(`${BASE_URL}/store-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Avatar Store',
        slug: `invalid-avatar-${Date.now()}`,
        description: 'Nice description.',
        avatarUrl: longAvatarUrl,
      }),
    });
    console.log('Expected Status Code: 400');
    console.log('Actual Status Code:', invalidAvatarRes.status);
    console.log('Response Body:', JSON.stringify(await invalidAvatarRes.json(), null, 2));

    // 5. Approval Flow (Check fields copied)
    console.log('\n--- [Test 4] Approve Store Request and Verify Copy ---');
    const approveRes = await fetch(`${BASE_URL}/store-requests/${requestId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', approveRes.status);
    const approveBody = await approveRes.json();
    console.log('Response Body (Store Details):', JSON.stringify(approveBody.data.store, null, 2));
    const storeId = approveBody.data.store.id;

    // 6. Verify Public Storefront listing contains description and avatarUrl
    console.log('\n--- [Test 5] Verify Public Storefront GET /stores ---');
    const publicStoresRes = await fetch(`${BASE_URL}/stores`, { method: 'GET' });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', publicStoresRes.status);
    const publicBody = await publicStoresRes.json();
    const publicStoreObj = publicBody.data.stores.find((s) => s.id === storeId);
    console.log('Matched Public Store Item:', JSON.stringify(publicStoreObj, null, 2));

    // 7. Verify Platform Store Directory contains description and avatarUrl
    console.log('\n--- [Test 6] Verify Platform Store Directory GET /stores/platform ---');
    const platformRes = await fetch(`${BASE_URL}/stores/platform`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('Expected Status Code: 200');
    console.log('Actual Status Code:', platformRes.status);
    const platformBody = await platformRes.json();
    const platformStoreObj = platformBody.data.stores.find((s) => s.id === storeId);
    console.log('Matched Platform Store Item:', JSON.stringify(platformStoreObj, null, 2));

    // Clean up
    console.log('\nCleaning up verification records...');
    await prisma.userStoreMembership.deleteMany({ where: { storeId } });
    await prisma.storeRequest.delete({ where: { id: requestId } });
    await prisma.store.delete({ where: { id: storeId } });
    await prisma.user.delete({ where: { email: tempUserEmail } });

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
