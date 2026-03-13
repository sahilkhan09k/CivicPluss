import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db/index.js';
import { notificationService } from './services/notificationService.js';
import { User } from './models/user.model.js';

const testNotifications = async () => {
    try {
        await connectDB();
        console.log('Connected to database');

        // Find a test user (you can replace with a specific user ID)
        const testUser = await User.findOne({ role: 'user' });
        if (!testUser) {
            console.log('No test user found');
            return;
        }

        console.log(`Sending test notification to user: ${testUser.name} (${testUser._id})`);

        // Send a test notification
        await notificationService.createAndSend({
            recipient: testUser._id,
            type: 'system_announcement',
            title: 'Test Notification',
            message: 'This is a test notification to verify the notification system is working.',
            data: {
                priority: 'medium',
                actionUrl: '/dashboard'
            }
        });

        console.log('Test notification sent successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error sending test notification:', error);
        process.exit(1);
    }
};

testNotifications();