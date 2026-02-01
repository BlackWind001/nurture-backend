require('dotenv').config();

async function getToken() {
  const userId = 'user_394VbjrRjGgPHBnLsFHI8Rr47kE'; // Your user ID
  
  try {
    console.log('🔄 Creating session...\n');
    
    // Step 1: Create a session
    const sessionResponse = await fetch('https://api.clerk.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        expires_in_seconds: 3600
      })
    });
    
    const sessionData = await sessionResponse.json();
    
    if (!sessionData.id) {
      console.log('❌ Failed to create session:');
      console.log(JSON.stringify(sessionData, null, 2));
      return;
    }
    
    console.log('✅ Session created:', sessionData.id);
    
    // Step 2: Get the JWT token from the session
    console.log('🔄 Fetching JWT token...\n');
    
    const tokenResponse = await fetch(`https://api.clerk.com/v1/sessions/${sessionData.id}/tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template: 'default'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.jwt) {
      console.log('✅ Success! Your JWT token:\n');
      console.log(tokenData.jwt);
      console.log('\n📋 Copy and run this command:\n');
      console.log(`export TOKEN="${tokenData.jwt}"`);
      console.log('\n🧪 Then test with:\n');
      console.log('curl http://localhost:9876/api/auth/me -H "Authorization: Bearer $TOKEN"');
    } else {
      console.log('❌ Failed to get JWT token:');
      console.log(JSON.stringify(tokenData, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getToken();