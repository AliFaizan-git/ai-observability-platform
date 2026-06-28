const { Queue } = require('bullmq');
const redis = require('../config/redis');

// Create a new queue named 'trace-ingestion' connected to our Redis instance
const traceQueue = new Queue('trace-ingestion', { connection: redis });

module.exports = traceQueue;