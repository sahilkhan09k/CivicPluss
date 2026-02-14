import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { DB_NAME } from './constants.js';

dotenv.config();

const testAdminLogin = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected to MongoDB');
        console.log('📊 Database:', DB_NAME);

        const email = 'admin@civic.com';
        const password = 'admin123';

        console.log('\n🔍 Testing login for:', email);

        // Find user
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ User not found in database');
            console.log('\n📋 All users in database:');
            const allUsers = await User.find({}).select('name email role city isEmailVerified');
            console.log(allUsers);
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('✅ User found:', {
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            isEmailVerified: user.isEmailVerified
        });

        // Test password
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        
        if (isPasswordCorrect) {
            console.log('✅ Password is CORRECT');
            console.log('✅ Login should work!');
        } else {
            console.log('❌ Password is INCORRECT');
            console.log('❌ The password hash does not match');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testAdminLogin();
