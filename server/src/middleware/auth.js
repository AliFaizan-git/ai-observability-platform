const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// JWT middleware (for dashboard users)
const requireJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API key middleware (for SDK ingestion calls)
const requireApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'No API key provided' });

  // Find user whose key matches (keyId is the prefix)
  const keyId = apiKey.slice(0, 20);
  const user = await User.findOne({ 'apiKeys.keyId': keyId });
  if (!user) return res.status(401).json({ error: 'Invalid API key' });

  // Find matching key and verify hash
  const keyRecord = user.apiKeys.find(k => k.keyId === keyId);
  const isValid = await bcrypt.compare(apiKey, keyRecord.keyHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid API key' });

  // Update last used
  keyRecord.lastUsed = new Date();
  await user.save();

  req.user = user;
  next();
};

module.exports = { requireJWT, requireApiKey };