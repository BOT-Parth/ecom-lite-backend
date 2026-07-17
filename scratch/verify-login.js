require('dotenv').config();

async function verifyLogin() {
  const url = 'http://localhost:5000/auth/login';
  const payload = {
    email: 'admin@ecomlite.com',
    password: 'super_secret_password_123'
  };

  try {
    console.log(`Sending POST request to ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`Status Code: ${response.status}`);
    const data = await response.json();
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Login verification failed:", error);
    process.exit(1);
  }
}

verifyLogin();
