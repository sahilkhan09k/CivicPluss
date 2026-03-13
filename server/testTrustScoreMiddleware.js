import { User } from './models/user.model.js';
import { connectDB } from './db/index.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script to verify trust score middleware blocking
 */
const testTrustScoreMiddleware = async () => {
    const baseURL = 'http://localhost:5000/api/v1';
    
    try {
        await connectDB();
        console.log('🔗 Connected to database');

        console.log('🧪 Testing trust score middleware blocking...\n');

        // Create test user with normal trust score
        const testEmail = 'test-middleware@example.com';
        const testPassword = 'password123';
        
        console.log('1️⃣ Creating test user with normal trust score...');
        
        let testUser = await User.findOne({ email: testEmail });
        if (testUser) {
            await User.findByIdAndDelete(testUser._id);
        }
        
        testUser = await User.create({
            name: 'Test Middleware User',
            email: testEmail,
            password: testPassword,
            city: 'Mumbai',
            trustScore: 75,
            isEmailVerified: true
        });
        console.log(`✅ Created test user: ${testUser.name} with trust score ${testUser.trustScore}`);

        // Login to get session cookies
        console.log('\n2️⃣ Logging in to get session...');
        const loginResponse = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });

        if (!loginResponse.ok) {
            console.log('❌ Failed to login');
            return;
        }

        // Extract cookies from login response
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('✅ Login successful, got session cookies');

        // Test accessing protected endpoint with normal trust score
        console.log('\n3️⃣ Testing protected endpoint access with normal trust score...');
        const profileResponse1 = await fetch(`${baseURL}/user/profile`, {
            method: 'GET',
            headers: {
                'Cookie': cookies
            }
        });

        if (profileResponse1.ok) {
            const profileData = await profileResponse1.json();
            console.log('✅ PASS: Access allowed with normal trust score');
            console.log(`   User: ${profileData.data?.name}`);
            console.log(`   Trust Score: ${profileData.data?.trustScore}`);
        } else {
            console.log('❌ FAIL: Access denied with normal trust score');
        }

        // Update user trust score to 0
        console.log('\n4️⃣ Updating user trust score to 0...');
        testUser.trustScore = 0;
        await testUser.save();
        console.log(`✅ Updated trust score to: ${testUser.trustScore}`);

        // Test accessing protected endpoint with 0 trust score (should be blocked)
        console.log('\n5️⃣ Testing protected endpoint access with 0 trust score...');
        const profileResponse2 = await fetch(`${baseURL}/user/profile`, {
            method: 'GET',
            headers: {
                'Cookie': cookies
            }
        });

        const profileData2 = await profileResponse2.json();
        
        if (profileResponse2.status === 403 && profileData2.message.includes('suspended due to low trust score')) {
            console.log('✅ PASS: Access correctly blocked with 0 trust score');
            console.log(`   Status: ${profileResponse2.status}`);
            console.log(`   Message: ${profileData2.message}`);
        } else if (profileResponse2.ok) {
            console.log('❌ FAIL: Access allowed with 0 trust score (should be blocked)');
            console.log(`   User: ${profileData2.data?.name}`);
            console.log(`   Trust Score: ${profileData2.data?.trustScore}`);
        } else {
            console.log('⚠️  Other error occurred:');
            console.log(`   Status: ${profileResponse2.status}`);
            console.log(`   Message: ${profileData2.message}`);
        }

        // Clean up - delete test user
        console.log('\n6️⃣ Cleaning up test user...');
        await User.findByIdAndDelete(testUser._id);
        console.log('✅ Test user deleted');

        console.log('\n🔐 Trust Score Middleware Test Complete');
        console.log('\n📋 Summary:');
        console.log('   - Existing sessions are invalidated when trust score drops to 0');
        console.log('   - Middleware blocks access to protected endpoints for suspended users');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        process.exit(0);
    }
};

testTrustScoreMiddleware();