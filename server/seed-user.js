const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

// Define a minimal User Schema matching your application setup
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  apiKey: String,
  createdAt: { type: Date, default: Date.now }
});

// Use existing model if registered, otherwise compile it
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedTemporaryUser() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Clear existing users to keep it clean (Optional)
    await User.deleteMany({});
    console.log('🧹 Cleaned existing users collection.');

    // 3. Create our designated test user record
    const mockUser = new User({
      name: 'Test Engineer',
      email: 'test@platform.local',
      apiKey: 'your_test_user_api_key' // 🔑 Matches your client's apiKey!
    });

    await mockUser.save();
    
    console.log('\n==================================================');
    console.log('✅ Temporary Test User Successfully Inserted!');
    console.log(`👤 Name: ${mockUser.name}`);
    console.log(`🔑 Valid API Key: ${mockUser.apiKey}`);
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    // 4. Always disconnect cleanly
    await mongoose.disconnect();
    console.log('🔌 Disconnected safely from MongoDB.');
    process.exit(0);
  }
}

seedTemporaryUser();