import { User } from './models/user.model.js';
import { connectDB } from './db/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script to verify trust score authentication blocking
 */
const testTrustScoreAuth = async () => {
    try {
        await connectDB();
        console.log('🔗 Connected to database');

        // Find a user with trust score 0
        const zeroTrustUser = await User.findOne({ trustScore: 0, role: 'user' });
        
        if (zeroTrustUser) {
            console.log(`👤 Found user with 0 trust score: ${zeroTrustUser.name} (${zeroTrustUser.email})`);
            console.log(`📊 Trust Score: ${zeroTrustUser.trustScore}`);
            console.log(`🚫 Should be blocked from login: YES`);
        } else {
            console.log('❌ No users found with 0 trust score');
            
            // Create a test user with 0 trust score for testing
            console.log('🧪 Creating test user with 0 trust score...');
            const testUser = await User.create({
                name: 'Test Zero Trust User',
                email: 'test-zero-trust@example.com',
                password: 'password123',
                city: 'Mumbai',
                trustScore: 0,
                isEmailVerified: true
            });
            console.log(`✅ Created test user: ${testUser.name} with trust score ${testUser.trustScore}`);
        }

        // Find users with low trust scores
        const lowTrustUsers = await User.find({ 
            trustScore: { $lte: 25 }, 
            role: 'user' 
        }).select('name email trustScore');

        console.log(`\n📉 Users with low trust scores (≤25):`);
        lowTrustUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email}): ${user.trustScore}`);
        });

        // Find users with normal trust scores
        const normalTrustUsers = await User.find({ 
            trustScore: { $gt: 25 }, 
            role: 'user' 
        }).select('name email trustScore').limit(5);

        console.log(`\n✅ Users with normal trust scores (>25):`);
        normalTrustUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email}): ${user.trustScore}`);
        });

        console.log('\n🔐 Trust Score Authentication Rules:');
        console.log('  - Users with trust score ≤ 0: BLOCKED from login');
        console.log('  - Users with trust score > 0: ALLOWED to login');
        console.log('  - Admins and super_admins: ALWAYS ALLOWED (trust score ignored)');

    } catch (error) {
        console.error('❌ Error testing trust score auth:', error);
    } finally {
        process.exit(0);
    }
};

testTrustScoreAuth();