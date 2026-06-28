const { Worker } = require('bullmq');
const Evaluation = require('../models/Evaluation');
const Trace = require('../models/Trace');
const User = require('../models/User');
const alertQueue = require('../queue/alertQueue');
const { runLLMJudge, computeComposite } = require('../services/evaluator');
const redis = require('../config/redis');

const evalWorker = new Worker('eval-pipeline', async (job) => {
  const { traceId, userId, messages, response, experimentId, variantId } = job.data;

  // 1. Create a pending evaluation record in MongoDB
  const evaluation = await Evaluation.create({
    traceId,
    userId,
    status: 'pending',
    method: 'llm_judge',
  });

  try {
    console.log(`Running Gemini Judge for trace: ${traceId}`);
    
    // 2. Call our Gemini Service
    const { scores, reasoning, judgeModel } = await runLLMJudge({ messages, response });

    // 3. Get user's custom weights to calculate final score
    const user = await User.findById(userId).select('evalWeights').lean();
    const composite = computeComposite(scores, user?.evalWeights);

    // 4. Save the final scores to the database
    await Evaluation.findByIdAndUpdate(evaluation._id, {
      scores,
      compositeScore: parseFloat(composite.toFixed(4)),
      judgeReasoning: reasoning,
      judgeModel,
      status: 'complete',
    });

    // 5. Mark the original trace as 'evaluated'
    await Trace.findByIdAndUpdate(traceId, { status: 'evaluated' });

    // 6. Update experiment stats if applicable
    if (experimentId && variantId) {
      const Experiment = require('../models/Experiment');
      const exp = await Experiment.findById(experimentId);
      if (exp) {
        const variant = exp.variants.find(v => v.variantId === variantId);
        if (variant) {
          const n = variant.stats.callCount;
          // Rolling average formula
          variant.stats.avgCompositeScore = ((variant.stats.avgCompositeScore * (n - 1)) + composite) / n;
          await exp.save();
        }
      }
    }

    // 7. Queue an alert check to see if model quality just dropped!
    await alertQueue.add('check-regression', { userId, compositeScore: composite }, {
      attempts: 2,
    });

    return { evaluationId: evaluation._id, compositeScore: composite };

  } catch (err) {
    await Evaluation.findByIdAndUpdate(evaluation._id, {
      status: 'failed',
      error: err.message,
    });
    throw err;
  }

}, { connection: redis, concurrency: 10 }); // Concurrency 10 so we don't hit Gemini rate limits

evalWorker.on('failed', (job, err) => {
  console.error(`Eval job ${job?.id} failed:`, err.message);
});

module.exports = evalWorker;