import fetch from 'node-fetch';

/**
 * Test script to verify trust score login blocking
 */
const testTrustScoreLogin = async () => {
    const baseURL = 'http://localhost:5000/api/v1';
    
    console.log('🧪 Testing trust score login blocking...\n');

    // Test user with 0 trust score (should be blocked)
    console.log('1️⃣ Testing login with user who has 0 trust score...');
    try {
        const response = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'sahilkhan392005@gmail.com',
                password: 'sahil123' // You may need to adjust this password
            })
        });

        const data = await response.json();
        
        if (response.status === 403 && data.message.includes('suspended due to low trust score')) {
            console.log('✅ PASS: User with 0 trust score was correctly blocked');
            console.log(`   Status: ${response.status}`);
            console.log(`   Message: ${data.message}`);
        } else if (response.ok) {
            console.log('❌ FAIL: User with 0 trust score was allowed to login (should be blocked)');
            console.log(`   Status: ${response.status}`);
            console.log(`   User: ${data.data?.name} (${data.data?.email})`);
            console.log(`   Trust Score: ${data.data?.trustScore}`);
        } else {
            console.log('⚠️  Other error occurred:');
            console.log(`   Status: ${response.status}`);
            console.log(`   Message: ${data.message}`);
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }

    console.log('\n2️⃣ Testing login with user who has normal trust score...');
    try {
        const response = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'koe@gmail.com',
                password: 'koe123' // You may need to adjust this password
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ PASS: User with normal trust score was allowed to login');
            console.log(`   Status: ${response.status}`);
            console.log(`   User: ${data.data?.name} (${data.data?.email})`);
            console.log(`   Trust Score: ${data.data?.trustScore}`);
        } else {
            console.log('⚠️  Login failed (may be wrong password):');
            console.log(`   Status: ${response.status}`);
            console.log(`   Message: ${data.message}`);
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }

    console.log('\n🔐 Trust Score Authentication Test Complete');
};

testTrustScoreLogin();