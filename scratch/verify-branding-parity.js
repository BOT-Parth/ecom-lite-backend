require('dotenv').config();
const baseUrl = 'http://localhost:5000';

async function testBrandingParity() {
  try {
    // 1. Login
    console.log("1. Logging in as 123456@123456.com...");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '123456@123456.com',
        password: 'password123',
      }),
    });
    console.log(`Login HTTP Status: ${loginRes.status}`);
    const loginData = await loginRes.json();
    console.log("Login Response Body:", JSON.stringify(loginData, null, 2));
    if (!loginData.data) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    const token = loginData.data.token;
    const initialUser = loginData.data.user;
    const storeId = initialUser.authorization.storeMemberships[0].storeId;

    console.log(`Store ID: ${storeId}`);
    console.log(`Initial Store Name in Membership: ${initialUser.authorization.storeMemberships[0].storeName}`);

    // 2. Update store settings via PATCH
    console.log("\n2. Updating store settings...");
    const updateRes = await fetch(`${baseUrl}/stores/${storeId}/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '123456 Store (Branding Updated)',
        description: 'New test description for storefront branding integration.',
        avatarUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100'
      })
    });
    console.log(`Update settings status: ${updateRes.status}`);

    // 3. Fetch profile context again to check if name/avatar propagated to memberships
    console.log("\n3. Fetching updated profile...");
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    const updatedUser = profileData.data.user;
    console.log("Updated storeMemberships:", JSON.stringify(updatedUser.authorization.storeMemberships, null, 2));

    // Verify properties
    const membership = updatedUser.authorization.storeMemberships[0];
    if (membership.storeName === '123456 Store (Branding Updated)' && membership.storeSlug === '123456123456com') {
      console.log("✅ SUCCESS: Profile context updated correctly on backend.");
    } else {
      console.error("❌ FAILED: Profile context did not update correctly on backend.");
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testBrandingParity();
