require("dotenv").config();
const app = require("../src/app");
const { prisma, pool } = require("../src/config/prisma");

const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}`;

async function runVerification() {
  // console.log('Starting live HTTP endpoint verification for GET /stores/platform...');
  const server = app.listen(PORT);

  try {
    // 1. Get tokens
    // console.log('\n--- Authenticating Users ---');

    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
      }),
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.data.token;
    // console.log('SUPER_ADMIN Token resolved successfully');

    // Create a temporary regular user for unauthorized test
    const tempUserEmail = `verify_user_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: tempUserEmail,
        username: "verifyuser",
        password: "password123",
      }),
    });

    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: tempUserEmail,
        password: "password123",
      }),
    });
    const userLogin = await userLoginRes.json();
    const userToken = userLogin.data.token;
    // console.log('Regular User Token resolved successfully');

    // 2. Unauthorized Request (No token)
    // console.log('\n--- [Test 1] Unauthorized Request (No Token) ---');
    console.log("Request: GET /stores/platform");
    // const noTokenRes = await fetch(`${BASE_URL}/stores/platform`, { method: 'GET' });
    // console.log('Expected Status Code: 401');
    // console.log('Actual Status Code:', noTokenRes.status);
    // console.log('Response Body:', JSON.stringify(await noTokenRes.json(), null, 2));

    // 3. Forbidden Request (Regular user token)
    // console.log('\n--- [Test 2] Forbidden Request (Regular User Token) ---');
    // console.log('Request: GET /stores/platform');
    // console.log('Headers: Authorization: Bearer <userToken>');
    const forbiddenRes = await fetch(`${BASE_URL}/stores/platform`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    // console.log('Expected Status Code: 403');
    // console.log('Actual Status Code:', forbiddenRes.status);
    // console.log('Response Body:', JSON.stringify(await forbiddenRes.json(), null, 2));

    // 4. Authorized Request (SUPER_ADMIN token)
    // console.log('\n--- [Test 3] Authorized Request (SUPER_ADMIN Token) ---');
    // console.log('Request: GET /stores/platform');
    // console.log('Headers: Authorization: Bearer <adminToken>');
    const authorizedRes = await fetch(`${BASE_URL}/stores/platform`, {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    // console.log('Expected Status Code: 200');
    // console.log('Actual Status Code:', authorizedRes.status);
    // console.log('Response Body:', JSON.stringify(await authorizedRes.json(), null, 2));

    // Clean up temp user
    await prisma.user.delete({ where: { email: tempUserEmail } });
  } catch (error) {
    console.error("Verification failed with error:", error);
  } finally {
    server.close(async () => {
      console.log("\nHTTP Server closed.");
      await prisma.$disconnect();
      await pool.end();
      process.exit(0);
    });
  }
}

runVerification();
