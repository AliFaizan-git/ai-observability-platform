const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },

  // API keys (hashed for security)
  apiKeys: [{
    keyId: String,                           // prefix like "obs_live_..."
    keyHash: String,                         // bcrypt hash of the actual key
    name: String,                            // human label e.g. "Production"
    lastUsed: Date,
    createdAt: { type: Date, default: Date.now },
  }],

  // Per-user eval weights (what matters most to them)
  evalWeights: {
    quality: { type: Number, default: 0.3 },
    hallucination: { type: Number, default: 0.3 },
    safety: { type: Number, default: 0.2 },
    relevance: { type: Number, default: 0.1 },
    coherence: { type: Number, default: 0.1 },
  },

  // Alert configuration
  alertConfig: {
    enabled: { type: Boolean, default: true },
    thresholdDrop: { type: Number, default: 0.1 }, // alert if score drops by 10%
    windowSize: { type: Number, default: 50 },     // rolling window of last N traces
    slackWebhookUrl: String,
    alertEmail: String,
  },

}, { timestamps: true });

// Hash password before save
//  Correct Modern Pattern
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // No next() function invocation needed!
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate API key
UserSchema.methods.generateApiKey = function (name) {
  const rawKey = `obs_live_${crypto.randomBytes(24).toString('hex')}`;
  const keyId = rawKey.slice(0, 20);
  // Store hash, return raw key (only shown once)
  this.apiKeys.push({
    keyId,
    keyHash: bcrypt.hashSync(rawKey, 10),
    name,
  });
  return rawKey;
};

module.exports = mongoose.model('User', UserSchema);