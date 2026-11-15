import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI.trim() === '') {
    console.warn('⚠️  [MongoDB] MONGO_URI is currently blank in backend/.env.');
    console.warn('⚠️  [MongoDB] Please paste your MongoDB Atlas connection string into backend/.env to connect to the database.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ [MongoDB] Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [MongoDB] Connection Error: ${error.message}`);
  }
};

export default connectDB;
