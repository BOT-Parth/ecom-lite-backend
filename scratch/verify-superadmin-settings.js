require('dotenv').config();
const baseUrl = 'http://localhost:5000';

async function testSuperAdminSettings() {
  try {
    // 1. Login as SUPER_ADMIN
    console.log("Logging in as SUPER_ADMIN...");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ecomlite.com',
        password: 'super_secret_password_123',
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    // 2. Fetch platform stores to get a store ID
    console.log("Fetching platform stores...");
    const storesRes = await fetch(`${baseUrl}/stores/platform`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const storesData = await storesRes.json();
    const stores = storesData.data.stores;
    if (stores.length === 0) {
      console.log("No stores found in platform database.");
      return;
    }
    const targetStore = stores[0];
    console.log(`Targeting Store: ${targetStore.name} (${targetStore.id})`);

    // 3. Test GET settings as SUPER_ADMIN
    console.log("Requesting store settings as SUPER_ADMIN...");
    const getRes = await fetch(`${baseUrl}/stores/${targetStore.id}/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`GET Settings HTTP Status: ${getRes.status}`);
    const getData = await getRes.json();
    console.log("GET Settings Response Body:", JSON.stringify(getData, null, 2));

    // 4. Test PATCH settings as SUPER_ADMIN
    console.log("Updating store settings as SUPER_ADMIN...");
    const patchRes = await fetch(`${baseUrl}/stores/${targetStore.id}/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${targetStore.name} (Admin Edited)`,
        description: 'Updated by SUPER_ADMIN bypass check',
        avatarUrl: targetStore.avatarUrl
      })
    });
    console.log(`PATCH Settings HTTP Status: ${patchRes.status}`);
    const patchData = await patchRes.json();
    console.log("PATCH Settings Response Body:", JSON.stringify(patchData, null, 2));

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testSuperAdminSettings();
