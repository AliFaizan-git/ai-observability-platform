const { Worker } = require('bullmq');
const { checkForRegression } = require('../services/alertEngine');

const connection = { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT };

const alertWorker = new Worker('alert-check', async (job) => {
  const { userId, compositeScore } = job.data;
  await checkForRegression(userId, compositeScore);
}, { connection, concurrency: 5 });

alertWorker.on('failed', (job, err) => {
  console.error(`Alert job ${job?.id} failed:`, err.message);
});

module.exports = alertWorker;