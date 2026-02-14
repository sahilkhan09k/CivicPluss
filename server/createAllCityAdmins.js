import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { DB_NAME, CITIES } from './constants.js';

dotenv.config();

const createAllCityAdmins = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected to MongoDB\n');

        const createdAdmins = [];
        const existingAdmins = [];

        for (const city of CITIES) {
            const email = `${city.toLowerCase()}@civic.com`;
            
            // Check if admin already exists
            const existingAdmin = await User.findOne({ email });
            
            if (existingAdmin) {
                existingAdmins.push({
                    city,
                    email,
                    status: 'Already exists'
                });
                continue;
            }

            // Create new admin
            const adminData = {
                name: `${city} Admin`,
                email: email,
                password: 'admin123',
                role: 'admin',
                city: city,
                isEmailVerified: true
            };

            const admin = await User.create(adminData);
            createdAdmins.push({
                city,
                email,
                password: 'admin123',
                id: admin._id
            });
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log('                  ADMIN ACCOUNTS CREATED                    ');
        console.log('═══════════════════════════════════════════════════════════\n');

        if (createdAdmins.length > 0) {
            console.log(`✅ Created ${createdAdmins.length} new admin accounts:\n`);
            createdAdmins.forEach(admin => {
                console.log(`📍 ${admin.city}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Password: ${admin.password}`);
                console.log('');
            });
        }

        if (existingAdmins.length > 0) {
            console.log(`\n⚠️  ${existingAdmins.length} admins already existed:\n`);
            existingAdmins.forEach(admin => {
                console.log(`   ${admin.city}: ${admin.email}`);
            });
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('                    SUMMARY                                 ');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`Total Cities: ${CITIES.length}`);
        console.log(`New Admins Created: ${createdAdmins.length}`);
        console.log(`Already Existed: ${existingAdmins.length}`);
        console.log('\n📝 Default Password for all admins: admin123');
        console.log('🔐 Please change passwords after first login!');
        console.log('═══════════════════════════════════════════════════════════\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAllCityAdmins();
