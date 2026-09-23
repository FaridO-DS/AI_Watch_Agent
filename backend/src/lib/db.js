import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
    try {
        const MONGO_URI = ENV.MONGO_URI;
        if (!MONGO_URI) throw new Error('MONGO_URI is not defined'); 
        
        const conn = await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB', conn.connection.host)
        } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}