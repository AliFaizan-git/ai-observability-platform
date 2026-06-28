const express = require('express');
const { requireApiKey, requireJWT } = require('../middleware/auth');
const { ingestionLimiter } = require('../middleware/rateLimiter');
const traceQueue = require('../queue/traceQueue');
const Trace = require('../models/Trace');

const router = express.Router();

// 1. INGESTION ENDPOINT (For your SDKs/Agents)
// Notice we use requireApiKey here, NOT requireJWT!
router.post('/ingest', ingestionLimiter, requireApiKey, async (req, res) => {
  try {
    const traceData = req.body;

    // Push the heavy lifting to the Redis queue
    await traceQueue.add('process-trace', {
      traceData,
      userId: req.user._id // The auth middleware securely attached the user
    });

    // Instantly return success to the agent so it doesn't get blocked
    res.status(202).json({ success: true, message: 'Trace queued for processing' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. DASHBOARD ENDPOINT (For humans viewing the React UI)
// Notice we use requireJWT here, because this is for the web dashboard!
router.get('/', requireJWT, async (req, res) => {
  try {
    // Fetch the 100 most recent traces for the logged-in user
    const traces = await Trace.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json(traces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;