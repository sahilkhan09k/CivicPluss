import { User } from './models/user.model.js';
import { connectDB } from './db/index.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Complete test script to verify trust score login blocking
 */
const testTrustScoreLoginComplete = async () => {
    const baseURL = 'http://localhost:5000/api/v1';
    
    try {
        await connectDB();
        console.log('🔗 Connected to database');

        console.log('🧪 Testing trust score login blocking...\n');

        // Create or update a test user with 0 trust score
        const testEmail = 'test-zero-trust@example.com';
        const testPassword = 'password123';
        
        console.log('1️⃣ Creating/updating test user with 0 trust score...');
        
        let testUser = await User.findOne({ email: testEmail });
        if (testUser) {
            testUser.trustScore = 0;
            testUser.isEmailVerified = true;
            await testUser.save();
            console.log(`✅ Updated existing test user: ${testUser.name}`);
        } else {
            testUser = await User.create({
                name: 'Test Zero Trust User',
                email: testEmail,
                password: testPassword,
                city: 'Mumbai',
                trustScore: 0,
                isEmailVerified: true
            });
            console.log(`✅ Created new test user: ${testUser.name}`);
        }
        
        console.log(`   Trust Score: ${testUser.trustScore}`);

        // Test login with 0 trust score user (should be blocked)
        console.log('\n2️⃣ Testing login with 0 trust score user...');
        try {
            const response = await fetch(`${baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPassword
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

        // Update test user to have normal trust score
        console.log('\n3️⃣ Updating test user to have normal trust score...');
        testUser.trustScore = 75;
        await testUser.save();
        console.log(`✅ Updated trust score to: ${testUser.trustScore}`);

        // Test login with normal trust score (should work)
        console.log('\n4️⃣ Testing login with normal trust score...');
        try {
            const response = await fetch(`${baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPassword
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ PASS: User with normal trust score was allowed to login');
                console.log(`   Status: ${response.status}`);
                console.log(`   User: ${data.data?.name} (${data.data?.email})`);
                console.log(`   Trust Score: ${data.data?.trustScore}`);
            } else {
                console.log('❌ FAIL: User with normal trust score was blocked');
                console.log(`   Status: ${response.status}`);
                console.log(`   Message: ${data.message}`);
            }
        } catch (error) {
            console.log('❌ Network error:', error.message);
        }

        // Clean up - delete test user
        console.log('\n5️⃣ Cleaning up test user...');
        await User.findByIdAndDelete(testUser._id);
        console.log('✅ Test user deleted');

        console.log('\n🔐 Trust Score Authentication Test Complete');
        console.log('\n📋 Summary:');
        console.log('   - Users with trust score ≤ 0: Should be BLOCKED from login');
        console.log('   - Users with trust score > 0: Should be ALLOWED to login');
        console.log('   - Admins and super_admins: Always allowed (trust score ignored)');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        process.exit(0);
    }
};

testTrustScoreLoginComplete();