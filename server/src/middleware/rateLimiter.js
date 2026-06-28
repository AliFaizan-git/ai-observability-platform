const rateLimit = require('express-rate-limit');

// Strict limiter for trace ingestion
const ingestionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,            // 1000 traces per minute per IP
  message: { error: 'Too many requests, slow down' },
});

// Standard limiter for dashboard API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: 'Too many requests' },
});

module.exports = { ingestionLimiter, apiLimiter };