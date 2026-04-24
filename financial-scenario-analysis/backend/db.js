import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGO_URI) {
    throw new Error('MONGODB_URI is required in backend/.env');
}

export async function connectDB() {
    try {
        const connectionOptions = {
            dbName: MONGO_DB_NAME,
            minPoolSize: 2,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            autoIndex: true,
        };

        await mongoose.connect(MONGO_URI, connectionOptions);
        console.log(`✅ MongoDB connected to ${MONGO_DB_NAME || 'default database'}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export default mongoose;
