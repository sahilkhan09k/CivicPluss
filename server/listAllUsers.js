import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { DB_NAME } from './constants.js';

dotenv.config();

const listAllUsers = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected to MongoDB\n');

        const users = await User.find({}).select('name email role city');

        console.log('📋 All Users in Database:\n');
        console.log('═'.repeat(80));
        
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   City: ${user.city || '❌ NOT SET'}`);
            console.log(`   ID: ${user._id}`);
        });

        console.log('\n' + '═'.repeat(80));
        console.log(`\nTotal users: ${users.length}`);
        
        const usersWithoutCity = users.filter(u => !u.city);
        if (usersWithoutCity.length > 0) {
            console.log(`\n⚠️  ${usersWithoutCity.length} user(s) without city assigned:`);
            usersWithoutCity.forEach(u => {
                console.log(`   - ${u.email} (${u.role})`);
            });
            console.log('\n💡 Run "npm run check-user-city" to update these users');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

listAllUsers();
