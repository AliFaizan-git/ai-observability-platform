const { Worker } = require('bullmq');
const Trace = require('../models/Trace');
const evalQueue = require('../queue/evalQueue');
const redis = require('../config/redis');

// The worker listens to the 'trace-ingestion' queue
const traceWorker = new Worker('trace-ingestion', async (job) => {
  const { traceData, userId } = job.data;
  console.log(`Processing trace for user: ${userId}`);

  // 1. Save trace to MongoDB
  const trace = await Trace.create({
    traceId: traceData.traceId || require('crypto').randomUUID(),
    userId: userId,
    provider: traceData.provider,
    model: traceData.model,
    messages: traceData.messages,
    response: traceData.response,
    latencyMs: traceData.latencyMs,
    promptTokens: traceData.promptTokens,
    completionTokens: traceData.completionTokens,
    totalTokens: traceData.totalTokens,
    estimatedCostUsd: traceData.estimatedCostUsd || 0,
    sessionId: traceData.sessionId,
    experimentId: traceData.experimentId,
    variantId: traceData.variantId,
    tags: traceData.tags || [],
    metadata: traceData.metadata || {},
  });

  // 2. Update experiment stats if this trace is part of an A/B test
  if (traceData.experimentId && traceData.variantId) {
    const Experiment = require('../models/Experiment');
    await Experiment.findOneAndUpdate(
      { _id: traceData.experimentId, 'variants.variantId': traceData.variantId },
      {
        $inc: { 'variants.$.stats.callCount': 1 },
        $set: { 'variants.$.stats.avgLatencyMs': traceData.latencyMs },
      }
    );
  }

  // 3. Queue evaluation job
  // We pass the trace data to the eval queue so the LLM Judge can grade it
  await evalQueue.add('evaluate-trace', {
    traceId: trace._id.toString(),
    userId: userId,
    model: traceData.model,
    messages: traceData.messages,
    response: traceData.response,
    experimentId: traceData.experimentId,
    variantId: traceData.variantId,
  }, {
    attempts: 3, // Retry up to 3 times if the LLM judge fails
    backoff: { type: 'exponential', delay: 3000 },
    delay: 500, // Slight delay to avoid hammering the database instantly
  });

  return { traceId: trace._id };

}, { connection: redis, concurrency: 20 }); // Can process 20 traces simultaneously

traceWorker.on('failed', (job, err) => {
  console.error(`Trace job ${job?.id} failed:`, err.message);
});

module.exports = traceWorker;