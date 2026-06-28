const express = require('express');
const Dataset = require('../models/Dataset');
const Trace = require('../models/Trace');
const { requireJWT } = require('../middleware/auth');
const { runLLMJudge, computeComposite } = require('../services/evaluator');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Create a new Dataset entry point
router.post('/', requireJWT, async (req, res) => {
  try {
    const { name, description } = req.body;
    const dataset = await Dataset.create({ userId: req.user._id, name, description });
    res.status(201).json(dataset);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Add a Production Trace to your Dataset (Saves actual runs for future benchmarking)
router.post('/:id/entries', requireJWT, async (req, res) => {
  try {
    const { traceId, expectedOutput } = req.body;

    const trace = await Trace.findOne({ _id: traceId, userId: req.user._id });
    if (!trace) return res.status(404).json({ error: 'Trace not found' });

    await Dataset.findByIdAndUpdate(req.params.id, {
      $push: {
        entries: {
          traceId: trace._id,
          input: trace.messages,
          expectedOutput,
          tags: trace.tags,
        }
      },
      $inc: { entryCount: 1 },
    });

    res.json({ message: 'Entry added successfully to dataset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. REPLAY ENGINE: Evaluates a dataset against a brand-new updated System Prompt
router.post('/:id/replay', requireJWT, async (req, res) => {
  try {
    const { newSystemPrompt, model = 'gemini-1.5-flash' } = req.body;
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    // Instantly confirm receipt so the web dashboard doesn't experience an HTTP timeout
    res.json({ message: 'Replay process started in background', entries: dataset.entries.length });

    // Run asynchronously in the background loop
    runReplay(dataset, newSystemPrompt, model, req.user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Executes historical conversations against the target prompt using Gemini
 */
async function runReplay(dataset, systemPrompt, modelName, user) {
  const results = [];
  const geminiModel = genAI.getGenerativeModel({ model: modelName });

  for (const entry of dataset.entries) {
    try {
      // Inject the modified system prompt, filtering out any old historical system configurations
      const cleanInput = entry.input.filter(m => m.role !== 'system');
      
      // Structure formatting specifically targeted for the Gemini contents generation array
      const chatHistory = cleanInput.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Prepend system instruction payload to the historical message array context
      const fullSystemPrompt = systemPrompt;

      const startTime = Date.now();
      const chat = geminiModel.startChat({
        history: chatHistory.slice(0, -1), // feed all but the last prompt message as history context
        systemInstruction: fullSystemPrompt
      });

      // Fetch the concluding conversation query
      const finalPromptText = chatHistory[chatHistory.length - 1]?.parts[0]?.text || '';
      const completion = await chat.sendMessage(finalPromptText);
      const latencyMs = Date.now() - startTime;

      const responseText = completion.response.text();

      // Convert message format backward compatible for the automated LLM Judge evaluator
      const evaluationFormatMessages = [
        { role: 'system', content: systemPrompt },
        ...entry.input.filter(m => m.role !== 'system')
      ];

      // Request an automated evaluation calculation directly from the LLM Judge Engine
      const { scores } = await runLLMJudge({ messages: evaluationFormatMessages, response: responseText });
      const composite = computeComposite(scores, user.evalWeights);

      results.push({ 
        latencyMs, 
        compositeScore: composite, 
        // Gemini API costs are completely zero on free tiers!
        costUsd: 0 
      });
    } catch (err) {
      console.error('Replay execution error on dataset item:', err.message);
    }
  }

  if (results.length === 0) return;

  // Process data matrices math aggregations
  const avgScore = results.reduce((s, r) => s + r.compositeScore, 0) / results.length;
  const avgLatency = results.reduce((s, r) => s + r.latencyMs, 0) / results.length;
  const totalCost = results.reduce((s, r) => s + r.costUsd, 0);

  // Write analytical metrics into database schema records
  await Dataset.findByIdAndUpdate(dataset._id, {
    $push: {
      replays: {
        promptVersion: systemPrompt.slice(0, 80),
        model: modelName,
        runAt: new Date(),
        avgCompositeScore: parseFloat(avgScore.toFixed(4)),
        avgLatencyMs: Math.round(avgLatency),
        totalCostUsd: parseFloat(totalCost.toFixed(6)),
      }
    }
  });

  console.log(`Replay execution finished for dataset ${dataset._id}: Evaluation Score Baseline Average: ${avgScore.toFixed(3)}`);
}

module.exports = router;