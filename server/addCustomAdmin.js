import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import { User } from './models/user.model.js';
import { DB_NAME, CITIES } from './constants.js';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const addCustomAdmin = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected to MongoDB\n');

        console.log('📝 Create New Admin/Super Admin User\n');

        const name = await question('Enter name: ');
        const email = await question('Enter email: ');
        const password = await question('Enter password: ');
        
        console.log('\nSelect role:');
        console.log('1. Admin (city-specific)');
        console.log('2. Super Admin (all cities)');
        const roleChoice = await question('Enter choice (1 or 2): ');

        let role, city;

        if (roleChoice === '2') {
            role = 'super_admin';
            city = null;
            console.log('✓ Super Admin selected (access to all cities)');
        } else {
            role = 'admin';
            console.log('\nAvailable cities:');
            CITIES.forEach((c, i) => console.log(`${i + 1}. ${c}`));
            const cityChoice = await question('\nEnter city number: ');
            const cityIndex = parseInt(cityChoice) - 1;
            
            if (cityIndex >= 0 && cityIndex < CITIES.length) {
                city = CITIES[cityIndex];
                console.log(`✓ Admin selected for ${city}`);
            } else {
                console.log('❌ Invalid city choice');
                rl.close();
                await mongoose.connection.close();
                process.exit(1);
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('\n❌ User with this email already exists!');
            rl.close();
            await mongoose.connection.close();
            process.exit(1);
        }

        // Create user
        const userData = {
            name,
            email,
            password,
            role,
            city,
            isEmailVerified: true
        };

        const user = await User.create(userData);

        console.log('\n✅ User created successfully!');
        console.log('   ID:', user._id);
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        if (user.city) {
            console.log('   City:', user.city);
        } else {
            console.log('   Access: All cities');
        }

        console.log('\n📝 Login Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);

        rl.close();
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        await mongoose.connection.close();
        process.exit(1);
    }
};

addCustomAdmin();
