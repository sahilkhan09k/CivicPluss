import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';


const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI?.trim();

        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('Attempting to connect to MongoDB...');

        const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`, {
            serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.error('Please check:');
        console.error('1. Your internet connection');
        console.error('2. MongoDB Atlas cluster is running');
        console.error('3. Your IP is whitelisted in MongoDB Atlas');
        console.error('4. Connection string is correct');
        process.exit(1);
    }
}

export { connectDB };