const { Queue } = require('bullmq');
const redis = require('../config/redis');

const alertQueue = new Queue('alert-check', { connection: redis });

module.exports = alertQueue;