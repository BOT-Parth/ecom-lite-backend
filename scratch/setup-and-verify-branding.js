require('dotenv').config();
const baseUrl = 'http://localhost:5000';

async function main() {
  try {
    const timestamp = Date.now();
    const merchantEmail = `brandmerchant_${timestamp}@test.com`;
    const merchantPassword = 'password123';
    const storeSlug = `brand-store-${timestamp}`;
    const storeName = `Brand Store ${timestamp}`;

    console.log(`1. Registering new merchant: ${merchantEmail}...`);
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: merchantEmail,
        username: `merchant_${timestamp}`,
        password: merchantPassword
      })
    });
    console.log(`Register Status: ${registerRes.status}`);

    console.log("\n2. Logging in as merchant...");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: merchantEmail,
        password: merchantPassword
      })
    });
    const loginData = await loginRes.json();
    const merchantToken = loginData.data.token;

    console.log("\n3. Submitting store request...");
    const reqRes = await fetch(`${baseUrl}/store-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${merchantToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: storeName,
        slug: storeSlug
      })
    });
    const reqData = await reqRes.json();
    const requestId = reqData.data.request.id;
    console.log(`Store request submitted. Request ID: ${requestId}`);

    console.log("\n4. Logging in as SUPER_ADMIN...");
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ecomlite.com',
        password: 'super_secret_password_123'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.token;

    console.log("\n5. Approving store request...");
    const approveRes = await fetch(`${baseUrl}/store-requests/${requestId}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const approveData = await approveRes.json();
    const storeId = approveData.data.store.id;
    console.log(`Store approved. Store ID: ${storeId}`);

    // Log in again to get refreshed profile containing memberships
    console.log("\n6. Refreshing merchant session...");
    const refreshRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: merchantEmail,
        password: merchantPassword
      })
    });
    const refreshData = await refreshRes.json();
    const refreshedToken = refreshData.data.token;
    console.log("Initial store name in profile membership:", refreshData.data.user.authorization.storeMemberships[0].storeName);

    // 7. Update store settings via PATCH settings
    console.log("\n7. Updating store settings...");
    const updateRes = await fetch(`${baseUrl}/stores/${storeId}/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${refreshedToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${storeName} (Updated)`,
        description: 'Storefront updated branding description.',
        avatarUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100'
      })
    });
    console.log(`PATCH Settings HTTP Status: ${updateRes.status}`);

    // 8. Fetch updated profile context to verify real-time update propagates
    console.log("\n8. Verifying real-time Profile Context propagation...");
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${refreshedToken}` }
    });
    const profileData = await profileRes.json();
    const updatedUser = profileData.data.user;
    const membership = updatedUser.authorization.storeMemberships[0];
    console.log("Refreshed storeMemberships:", JSON.stringify(updatedUser.authorization.storeMemberships, null, 2));

    if (membership.storeName === `${storeName} (Updated)`) {
      console.log("✅ SUCCESS: Profile context updated successfully on backend and propagated to memberships.");
    } else {
      console.error("❌ FAILED: Store settings update did not propagate to profile context memberships.");
    }

  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main();
