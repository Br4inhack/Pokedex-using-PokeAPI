const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('🏁 Starting automated API integration tests...\n');
  
  let token = '';

  // 1. Register a new user
  try {
    console.log('Step 1: Registering a new user...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "saurabh@example.com",
        password: "securepass123",
        username: "saurabh"
      })
    });
    const registerData = await registerRes.json();
    console.log(`Status: ${registerRes.status}`);
    console.log(`Response:`, JSON.stringify(registerData, null, 2));
    
    if (registerRes.status === 201 || registerRes.status === 409) {
      console.log('✅ Step 1 OK (or user already exists)\n');
    } else {
      throw new Error('Registration failed');
    }
  } catch (err) {
    console.error('❌ Step 1 Failed:', err.message);
  }

  // 2. Login to get a fresh token
  try {
    console.log('Step 2: Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "saurabh@example.com",
        password: "securepass123"
      })
    });
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status}`);
    console.log(`Response:`, JSON.stringify(loginData, null, 2));
    
    if (loginRes.status === 200) {
      token = loginData.data.token;
      console.log('✅ Step 2 OK (Token acquired)\n');
    } else {
      throw new Error('Login failed');
    }
  } catch (err) {
    console.error('❌ Step 2 Failed:', err.message);
    return;
  }

  // 3. Get profile with token
  try {
    console.log('Step 3: Get profile with Bearer token...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log(`Status: ${meRes.status}`);
    console.log(`Response:`, JSON.stringify(meData, null, 2));
    if (meRes.status === 200) {
      console.log('✅ Step 3 OK\n');
    } else {
      throw new Error('Get profile failed');
    }
  } catch (err) {
    console.error('❌ Step 3 Failed:', err.message);
  }

  // 4. Try without token (should fail with 401)
  try {
    console.log('Step 4: Access profile without Bearer token...');
    const meFailRes = await fetch(`${BASE_URL}/auth/me`);
    const meFailData = await meFailRes.json();
    console.log(`Status: ${meFailRes.status}`);
    console.log(`Response:`, JSON.stringify(meFailData, null, 2));
    if (meFailRes.status === 401) {
      console.log('✅ Step 4 OK (Failed with 401 as expected)\n');
    } else {
      throw new Error('Expected 401 but got another status');
    }
  } catch (err) {
    console.error('❌ Step 4 Failed:', err.message);
  }

  // 5. Add Pikachu to favorites
  try {
    console.log('Step 5: Adding "pikachu" to favorites...');
    const favRes = await fetch(`${BASE_URL}/favorites/pikachu`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const favData = await favRes.json();
    console.log(`Status: ${favRes.status}`);
    console.log(`Response:`, JSON.stringify(favData, null, 2));
    if (favRes.status === 201 || favRes.status === 409) {
      console.log('✅ Step 5 OK\n');
    } else {
      throw new Error('Adding favorite failed');
    }
  } catch (err) {
    console.error('❌ Step 5 Failed:', err.message);
  }

  // 6. Add more favorites (Charizard and Mewtwo)
  try {
    console.log('Step 6: Adding more favorites ("charizard", "mewtwo")...');
    
    // Add charizard
    const charRes = await fetch(`${BASE_URL}/favorites/charizard`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`Charizard Status: ${charRes.status}`);

    // Add mewtwo
    const mewRes = await fetch(`${BASE_URL}/favorites/mewtwo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`Mewtwo Status: ${mewRes.status}`);
    
    console.log('✅ Step 6 OK\n');
  } catch (err) {
    console.error('❌ Step 6 Failed:', err.message);
  }

  // 7. List favorites
  try {
    console.log('Step 7: Listing all favorites...');
    const listRes = await fetch(`${BASE_URL}/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    console.log(`Status: ${listRes.status}`);
    console.log(`Response:`, JSON.stringify(listData, null, 2));
    if (listRes.status === 200) {
      console.log('✅ Step 7 OK\n');
    } else {
      throw new Error('Listing favorites failed');
    }
  } catch (err) {
    console.error('❌ Step 7 Failed:', err.message);
  }

  // 8. Remove one (Charizard)
  try {
    console.log('Step 8: Deleting "charizard" from favorites...');
    const delRes = await fetch(`${BASE_URL}/favorites/charizard`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`Status: ${delRes.status}`);
    if (delRes.status === 204) {
      console.log('✅ Step 8 OK (Deleted successfully)\n');
    } else {
      throw new Error('Deletion failed');
    }
  } catch (err) {
    console.error('❌ Step 8 Failed:', err.message);
  }

  // 9. Try adding a duplicate (Pikachu)
  try {
    console.log('Step 9: Adding duplicate "pikachu" to favorites...');
    const dupRes = await fetch(`${BASE_URL}/favorites/pikachu`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dupData = await dupRes.json();
    console.log(`Status: ${dupRes.status}`);
    console.log(`Response:`, JSON.stringify(dupData, null, 2));
    if (dupRes.status === 409) {
      console.log('✅ Step 9 OK (Correctly threw 409 Conflict)\n');
    } else {
      throw new Error('Expected 409 Conflict but got another status');
    }
  } catch (err) {
    console.error('❌ Step 9 Failed:', err.message);
  }

  console.log('🎉 Automated integration testing complete!');
}

runTests();
