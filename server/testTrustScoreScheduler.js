import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db/index.js';
import { applyScheduledTrustScorePenalties } from './utils/trustScoreScheduler.js';

// Test the trust score scheduler
async function testScheduler() {
    try {
        console.log('🧪 Testing trust score scheduler...');
        
        await connectDB();
        console.log('✅ Connected to database');
        
        const processedCount = await applyScheduledTrustScorePenalties();
        console.log(`✅ Processed ${processedCount} scheduled penalties`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testScheduler();