import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { DB_NAME } from './constants.js';

dotenv.config();

const updateAdminVerification = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected to MongoDB\n');

        // Update all admin and super_admin users to be verified
        const result = await User.updateMany(
            { role: { $in: ['admin', 'super_admin'] } },
            { $set: { isEmailVerified: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} admin/super_admin users`);
        console.log(`   Total matched: ${result.matchedCount}`);

        // Show all admin users
        const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
            .select('name email role city isEmailVerified');

        console.log('\n📋 All Admin Users:');
        admins.forEach(admin => {
            console.log(`\n   ${admin.name}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   City: ${admin.city || 'All cities'}`);
            console.log(`   Email Verified: ${admin.isEmailVerified ? '✓' : '✗'}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

updateAdminVerification();
