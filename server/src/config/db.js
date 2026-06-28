const mongoose = require('mongoose');
// Force load your environment variables here to guarantee they are available
require('dotenv').config();

const connectDB = async () => {
  try {
    // If process.env.MONGO_URI is missing, use the local fallback string
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-observability';
    
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB Database');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Stop the server if the database fails to connect
  }
};

module.exports = connectDB;