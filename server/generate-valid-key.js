const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User'); // Double check this path matches your User model location

async function seedSecureUser() {
  try {
    await connectDB();
    await User.deleteMany({}); // Clears out the old unhashed user test records

    // 1. Define a prefix that is mathematically EXACTLY 20 characters
    const keyId = "ak_test_123456789012"; // 20 characters long!

    // 2. Define the secret portion (30 characters)
    const secretToken = "abcdefghijklmnopqrstuvwxyz1234";

    // 3. Combine them seamlessly (50 characters total)
    const fullApiKey = `${keyId}${secretToken}`;
    // 2. Hash the full API key using bcrypt just like your register logic does
    const salt = await bcrypt.genSalt(10);
    const hashedKey = await bcrypt.hash(fullApiKey, salt);

    // 3. Create a user matching your exact User schema structure
    const secureUser = new User({
      name: 'Integration Tester',
      email: 'test@observability.local',
      password: 'hashed_password_placeholder', // Dummy value to satisfy schema if required
      apiKeys: [{
        keyId: keyId,
        keyHash: hashedKey,
        name: 'Development Key',
        lastUsed: new Date()
      }]
    });

    await secureUser.save();

    console.log('\n================================================================');
    console.log('✅ SECURE USER & HASHED API KEY SEEDED TO MONGODB!');
    console.log('================================================================');
    console.log(`🔑 PASS THIS EXACT STRING TO YOUR SDK (test-pipeline.js):`);
    console.log(`👉   ${fullApiKey}`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('❌ Error seeding secure user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSecureUser();