const express = require('express');
const Experiment = require('../models/Experiment');
const { requireJWT } = require('../middleware/auth');
const { selectVariant } = require('../services/abRouter');
const { twoProportionZTest } = require('../services/stats');

const router = express.Router();

// 1. Create a new A/B Experiment
router.post('/', requireJWT, async (req, res) => {
  try {
    const { name, description, variants, minSampleSize } = req.body;

    // Validation: Enforce that traffic weights sum up exactly to 1.0 (100%)
    const totalWeight = variants.reduce((sum, v) => sum + v.trafficWeight, 0);
    if (Math.abs(totalWeight - 1) > 0.001) {
      return res.status(400).json({ error: 'Variant traffic weights must sum up exactly to 1.0' });
    }

    const experiment = await Experiment.create({
      userId: req.user._id,
      name,
      description,
      variants,
      minSampleSize: minSampleSize || 100, // Defaults to 100 runs before calculating results
    });

    res.status(201).json(experiment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Change Experiment Status (Start, Pause, Conclude)
router.patch('/:id/status', requireJWT, async (req, res) => {
  try {
    const { status } = req.body;
    const experiment = await Experiment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!experiment) return res.status(404).json({ error: 'Experiment not found' });
    res.json(experiment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Dynamically Assign Variant for an Incoming SDK Request
router.get('/:id/assign', requireJWT, async (req, res) => {
  try {
    const variant = await selectVariant(req.params.id);
    if (!variant) return res.status(404).json({ error: 'Experiment is not active or not found' });
    
    res.json({ 
      variantId: variant.variantId, 
      systemPrompt: variant.systemPrompt 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Calculate Live Statistical Significance and Identify Winner
router.get('/:id/significance', requireJWT, async (req, res) => {
  try {
    const experiment = await Experiment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!experiment) return res.status(404).json({ error: 'Experiment not found' });

    // The first item in our variants array is our 'Control' benchmark prompt
    const [control, ...variants] = experiment.variants;

    // Compute the significance test for every variant versus the control prompt
    const results = variants.map(variant => {
      const stats = twoProportionZTest(
        control.stats.avgCompositeScore, control.stats.callCount,
        variant.stats.avgCompositeScore, variant.stats.callCount
      );
      return { variantId: variant.variantId, name: variant.name, ...stats };
    });

    // Determine the winner if it holds positive mathematical significance
    const winner = results.filter(r => r.isSignificant && r.zScore > 0)
      .sort((a, b) => a.pValue - b.pValue)[0];

    res.json({
      control: { variantId: control.variantId, ...control.stats },
      variants: results,
      winner: winner || null,
      hasSufficientData: experiment.variants.every(v => v.stats.callCount >= experiment.minSampleSize),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;