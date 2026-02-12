import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { DB_NAME, CITIES } from './constants.js';

dotenv.config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected to MongoDB');

        // Create regular admin for Mumbai
        const adminData = {
            name: 'Mumbai Admin',
            email: 'admin@civic.com',
            password: 'admin123',
            role: 'admin',
            city: 'Mumbai',
            isEmailVerified: true
        };

        const existingAdmin = await User.findOne({ email: adminData.email });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('   Email:', existingAdmin.email);
            console.log('   Role:', existingAdmin.role);
            console.log('   City:', existingAdmin.city);
            console.log('   ID:', existingAdmin._id);
        } else {
            const admin = await User.create(adminData);
            console.log('✅ Admin user created successfully!');
            console.log('   ID:', admin._id);
            console.log('   Email:', admin.email);
            console.log('   Role:', admin.role);
            console.log('   City:', admin.city);
        }

        // Create super admin (can access all cities)
        const superAdminData = {
            name: 'Super Admin',
            email: 'superadmin@civic.com',
            password: 'super123',
            role: 'super_admin',
            city: null, // Super admin doesn't need a city
            isEmailVerified: true
        };

        const existingSuperAdmin = await User.findOne({ email: superAdminData.email });

        if (existingSuperAdmin) {
            console.log('\n⚠️  Super Admin user already exists!');
            console.log('   Email:', existingSuperAdmin.email);
            console.log('   Role:', existingSuperAdmin.role);
            console.log('   ID:', existingSuperAdmin._id);
        } else {
            const superAdmin = await User.create(superAdminData);
            console.log('\n✅ Super Admin user created successfully!');
            console.log('   ID:', superAdmin._id);
            console.log('   Email:', superAdmin.email);
            console.log('   Role:', superAdmin.role);
            console.log('   Access: All cities');
        }

        console.log('\n📝 Login Credentials:');
        console.log('\n👤 Admin (Mumbai only):');
        console.log('   Email: admin@civic.com');
        console.log('   Password: admin123');
        console.log('\n🔑 Super Admin (All cities):');
        console.log('   Email: superadmin@civic.com');
        console.log('   Password: super123');

        console.log('\n💡 Available cities:', CITIES.join(', '));

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdminUser();
