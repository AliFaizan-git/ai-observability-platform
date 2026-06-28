const Experiment = require('../models/Experiment');

/**
 * Selects a variant for an incoming request using weighted random selection.
 * Call this BEFORE making the LLM call so you know which prompt version to use.
 */
async function selectVariant(experimentId) {
  const experiment = await Experiment.findById(experimentId);
  if (!experiment || experiment.status !== 'running') return null;

  const rand = Math.random();
  let cumulative = 0;

  // Loop through variants and match against random weight bracket
  for (const variant of experiment.variants) {
    cumulative += variant.trafficWeight;
    if (rand <= cumulative) return variant;
  }

  // Fallback to the final variant just in case of rounding bugs
  return experiment.variants[experiment.variants.length - 1];
}

module.exports = { selectVariant };