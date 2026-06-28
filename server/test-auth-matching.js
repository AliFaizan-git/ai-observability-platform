const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function debugAuth() {
    try {
        await connectDB();

        // 1. Fetch the test user we seeded
        const user = await User.findOne({ email: 'test@observability.local' });

        if (!user) {
            console.log("❌ Could not find the test user in the database. Run your seed script again!");
            return;
        }

        console.log("\n================ DEBUG DATA ================");
        console.log("👤 User Found:", user.name);
        console.log("📦 Full User Document Object from DB:", JSON.stringify(user, null, 2));

        // 2. Hardcoded Key matching the generated pair we defined earlier
        // Ensure this matches the 50-character combined key from Step 1
        const testClientKey = "ak_test_123456789012abcdefghijklmnopqrstuvwxyz1234";
        const keyId = testClientKey.slice(0, 20);

        console.log(`\n🔍 Middleware Step 1: Slicing key to find keyId...`);
        console.log(`👉 Extracted keyId: "${keyId}"`);

        const keyRecord = user.apiKeys.find(k => k.keyId === keyId);
        if (!keyRecord) {
            console.log("❌ Middleware Step 2 Failed: No matching keyId found in user's apiKeys array.");
            return;
        }
        console.log("✅ Middleware Step 2 Passed: Found matching keyRecord inside user profile!");

        console.log(`\n🔒 Middleware Step 3: Comparing plain text client key against DB hash...`);
        const isValid = await bcrypt.compare(testClientKey, keyRecord.keyHash);

        if (isValid) {
            console.log("🎉 SUCCESS! Bcrypt matches perfectly. Your server should be returning 202!");
        } else {
            console.log("❌ BCRYPT FAILURE: The hash stored in your database does not match this key string.");
        }
        console.log("============================================\n");

    } catch (err) {
        console.error("Crash during auth debug:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

debugAuth();