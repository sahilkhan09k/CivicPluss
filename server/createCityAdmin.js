import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { DB_NAME, CITIES } from './constants.js';

dotenv.config();

// Get city from command line argument
const cityName = process.argv[2];

if (!cityName) {
    console.log('❌ Please provide a city name!');
    console.log('\nUsage: npm run create-city-admin <CityName>');
    console.log('\nExamples:');
    console.log('  npm run create-city-admin Ratnagiri');
    console.log('  npm run create-city-admin Pune');
    console.log('  npm run create-city-admin Nagpur');
    console.log('\n📋 Available cities:');
    CITIES.forEach((city, index) => {
        if (index % 5 === 0) console.log('');
        process.stdout.write(`  ${city.padEnd(15)}`);
    });
    console.log('\n');
    process.exit(1);
}

// Validate city name
if (!CITIES.includes(cityName)) {
    console.log(`❌ "${cityName}" is not a valid city!`);
    console.log('\n📋 Available cities:');
    CITIES.forEach((city, index) => {
        if (index % 5 === 0) console.log('');
        process.stdout.write(`  ${city.padEnd(15)}`);
    });
    console.log('\n');
    process.exit(1);
}

const createCityAdmin = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected to MongoDB\n');

        // Create admin for the specified city
        const email = `${cityName.toLowerCase()}@civic.com`;
        const adminData = {
            name: `${cityName} Admin`,
            email: email,
            password: 'admin123',
            role: 'admin',
            city: cityName,
            isEmailVerified: true
        };

        const existingAdmin = await User.findOne({ email: adminData.email });

        if (existingAdmin) {
            console.log(`⚠️  ${cityName} Admin already exists!`);
            console.log('   Email:', existingAdmin.email);
            console.log('   Role:', existingAdmin.role);
            console.log('   City:', existingAdmin.city);
            console.log('   ID:', existingAdmin._id);
            
            // Update city if it's not set or different
            if (!existingAdmin.city || existingAdmin.city !== cityName) {
                existingAdmin.city = cityName;
                await existingAdmin.save();
                console.log(`✅ Updated city to ${cityName}`);
            }
        } else {
            const admin = await User.create(adminData);
            console.log(`✅ ${cityName} Admin created successfully!`);
            console.log('   ID:', admin._id);
            console.log('   Email:', admin.email);
            console.log('   Role:', admin.role);
            console.log('   City:', admin.city);
        }

        console.log('\n📝 Login Credentials:');
        console.log(`   Email: ${email}`);
        console.log('   Password: admin123');
        console.log(`   City: ${cityName}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createCityAdmin();
