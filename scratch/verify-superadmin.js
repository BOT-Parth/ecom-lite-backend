const port = 5000;
const baseUrl = `http://localhost:${port}`;

async function main() {
  console.log('Verifying SUPER_ADMIN credentials from superAdmin.md...');

  try {
    // 1. Log in
    console.log('\n--- 1. Login ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ecomlite.com',
        password: 'super_secret_password_123',
      }),
    });
    
    if (loginRes.status !== 200) {
      console.error('Failed to log in:', await loginRes.text());
      process.exit(1);
    }
    
    const loginData = await loginRes.json();
    console.log('Login successful! Status:', loginRes.status);
    
    const token = loginData.data.token;
    
    // 2. Check authorization context
    console.log('\n--- 2. Checking Authorization Context ---');
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (profileRes.status !== 200) {
      console.error('Failed to get profile:', await profileRes.text());
      process.exit(1);
    }
    
    const profileData = await profileRes.json();
    console.log('Profile context retrieved:', JSON.stringify(profileData, null, 2));
    
    if (profileData.data.user.authorization.platformRole === 'SUPER_ADMIN') {
      console.log('✅ platformRole is SUPER_ADMIN in the profile context.');
    } else {
      console.error('❌ platformRole is NOT SUPER_ADMIN:', profileData.data.user.authorization.platformRole);
      process.exit(1);
    }
    
    // 3. Check access to GET /stores/platform
    console.log('\n--- 3. Verifying Access to /stores/platform ---');
    const platformRes = await fetch(`${baseUrl}/stores/platform`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (platformRes.status === 200) {
      console.log('✅ Access granted to GET /stores/platform (Status 200).');
    } else {
      console.error('❌ Access denied to GET /stores/platform (Status', platformRes.status, ')');
      console.error(await platformRes.text());
      process.exit(1);
    }
    
    console.log('\nAll checks passed successfully!');
    
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
}

main();
