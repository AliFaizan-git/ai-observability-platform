const { Queue } = require('bullmq');
const redis = require('../config/redis');

// Create a new queue named 'eval-pipeline' connected to our Redis instance
const evalQueue = new Queue('eval-pipeline', { connection: redis });

module.exports = evalQueue;