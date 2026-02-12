import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { DB_NAME } from './constants.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const checkAndUpdateUserCity = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected to MongoDB\n');

        const email = await question('Enter user email to check: ');
        
        const user = await User.findOne({ email: email.trim() });

        if (!user) {
            console.log('❌ User not found!');
            rl.close();
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('\n📋 User Information:');
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   City:', user.city || 'NOT SET');
        console.log('   ID:', user._id);

        if (!user.city) {
            console.log('\n⚠️  This user does not have a city assigned!');
            const shouldUpdate = await question('Do you want to assign a city? (yes/no): ');
            
            if (shouldUpdate.toLowerCase() === 'yes' || shouldUpdate.toLowerCase() === 'y') {
                const newCity = await question('Enter city name (e.g., Ratnagiri, Mumbai, Pune): ');
                user.city = newCity.trim();
                await user.save();
                console.log('✅ City updated to:', user.city);
            }
        } else {
            const shouldUpdate = await question('\nDo you want to change the city? (yes/no): ');
            
            if (shouldUpdate.toLowerCase() === 'yes' || shouldUpdate.toLowerCase() === 'y') {
                const newCity = await question('Enter new city name: ');
                user.city = newCity.trim();
                await user.save();
                console.log('✅ City updated to:', user.city);
            }
        }

        rl.close();
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
};

checkAndUpdateUserCity();
