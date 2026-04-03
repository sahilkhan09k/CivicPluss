/**
 * Test script for issue email notifications
 * Tests both resolution and spam email templates
 */

import dotenv from 'dotenv';
import { sendIssueResolvedEmail, sendIssueSpamEmail } from './utils/sendEmailResend.js';

dotenv.config();

const TEST_EMAIL = process.env.TEST_EMAIL || 'sahilkhan392005@gmail.com';

async function testEmails() {
    console.log('🧪 Testing Issue Email Notifications\n');
    console.log(`📧 Test email: ${TEST_EMAIL}\n`);

    // Mock issue data
    const mockIssue = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Large pothole on Main Street',
        city: 'Mumbai',
        description: 'There is a dangerous pothole that needs immediate attention'
    };

    const mockAdmin = {
        name: 'Test Admin',
        email: 'admin@civic.com'
    };

    try {
        // Test 1: Issue Resolved Email
        console.log('📧 Testing Issue Resolved Email...');
        await sendIssueResolvedEmail(TEST_EMAIL, {
            issue: mockIssue,
            resolvedScore: 85
        });
        console.log('✅ Issue resolved email sent successfully\n');

        // Test 2: Issue Spam Email
        console.log('📧 Testing Issue Spam Email...');
        await sendIssueSpamEmail(TEST_EMAIL, {
            issue: mockIssue,
            reportedBy: mockAdmin
        });
        console.log('✅ Issue spam email sent successfully\n');

        console.log('🎉 All email tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        process.exit(1);
    }
}

testEmails();