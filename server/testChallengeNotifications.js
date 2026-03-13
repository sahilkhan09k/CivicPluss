/**
 * Manual test script for challenge notification service
 * 
 * This script tests the notification service by sending sample emails
 * for each notification type (challenge_accepted, challenge_rejected, challenge_reviewed)
 * 
 * Usage: node testChallengeNotifications.js
 */

import dotenv from 'dotenv';
import { sendChallengeNotification, formatRejectionReason } from './services/notification.service.js';

// Load environment variables
dotenv.config();

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

async function testNotifications() {
    console.log('🧪 Testing Challenge Notification Service\n');
    console.log(`📧 Test email: ${TEST_EMAIL}\n`);

    try {
        // Test 1: Challenge Accepted Notification
        console.log('1️⃣ Testing challenge_accepted notification...');
        await sendChallengeNotification(TEST_EMAIL, 'challenge_accepted', {
            issueTitle: 'Broken Street Light on Main Street',
            similarityScore: 75,
            submittedAt: new Date()
        });
        console.log('✅ challenge_accepted notification sent successfully\n');

        // Wait a bit between emails
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test 2: Challenge Rejected Notification
        console.log('2️⃣ Testing challenge_rejected notification...');
        await sendChallengeNotification(TEST_EMAIL, 'challenge_rejected', {
            issueTitle: 'Pothole on Oak Avenue',
            rejectionReason: formatRejectionReason('low_similarity'),
            similarityScore: 35
        });
        console.log('✅ challenge_rejected notification sent successfully\n');

        // Wait a bit between emails
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test 3: Challenge Reviewed - Admin Wrong
        console.log('3️⃣ Testing challenge_reviewed notification (admin_wrong)...');
        await sendChallengeNotification(TEST_EMAIL, 'challenge_reviewed', {
            issueTitle: 'Graffiti on Park Bench',
            decision: 'admin_wrong',
            similarityScore: 82,
            reviewedAt: new Date(),
            reviewNotes: 'After careful review, the issue appears to still exist. Restoring to original state.'
        });
        console.log('✅ challenge_reviewed (admin_wrong) notification sent successfully\n');

        // Wait a bit between emails
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test 4: Challenge Reviewed - Admin Correct
        console.log('4️⃣ Testing challenge_reviewed notification (admin_correct)...');
        await sendChallengeNotification(TEST_EMAIL, 'challenge_reviewed', {
            issueTitle: 'Trash Overflow at Park',
            decision: 'admin_correct',
            similarityScore: 68,
            reviewedAt: new Date(),
            reviewNotes: 'The admin decision was appropriate based on the evidence provided.'
        });
        console.log('✅ challenge_reviewed (admin_correct) notification sent successfully\n');

        console.log('🎉 All notification tests completed successfully!');
        console.log(`\n📬 Check ${TEST_EMAIL} for the test emails.`);

    } catch (error) {
        console.error('❌ Notification test failed:', error);
        process.exit(1);
    }
}

// Test rejection reason formatting
console.log('🧪 Testing formatRejectionReason helper...');
console.log('location_too_far:', formatRejectionReason('location_too_far'));
console.log('low_similarity:', formatRejectionReason('low_similarity'));
console.log('invalid_photo:', formatRejectionReason('invalid_photo'));
console.log('unknown:', formatRejectionReason('unknown'));
console.log('');

// Run the tests
testNotifications();
