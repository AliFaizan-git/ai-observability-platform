const express = require('express');
const router = express.Router();
// Assuming your Mongoose Model names are capitalized under server/src/models/
const Evaluation = require('../models/Evaluation'); 
const Trace = require('../models/Trace');

/**
 * @route   GET /api/evaluations/stats
 * @desc    Get aggregated evaluation metrics (averages) over time for charts
 */
router.get('/stats', async (req, res) => {
  try {
    // Aggregates data to find global performance metric trends
    const stats = await Evaluation.aggregate([
      {
        $group: {
          _id: null,
          avgQuality: { $avg: '$metrics.quality' },
          avgRelevance: { $avg: '$metrics.relevance' },
          avgSafety: { $avg: '$metrics.safety' },
          totalEvaluated: { $sum: 1 }
        }
      }
    ]);

    const result = stats[0] || { avgQuality: 0, avgRelevance: 0, avgSafety: 0, totalEvaluated: 0 };
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/evaluations/:traceId
 * @desc    Get specific evaluation score data for an individual execution trace
 */
router.get('/:traceId', async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ traceId: req.params.traceId });
    if (!evaluation) {
      return res.status(404).json({ success: false, error: 'Evaluation metrics not found for this trace' });
    }
    res.json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🚀 CRITICAL: This line fixes the Express crash!
module.exports = router;