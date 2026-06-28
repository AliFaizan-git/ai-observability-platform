/**
 * Two-proportion Z-test for A/B experiment significance.
 * Used to determine if the difference in composite scores between
 * two variants is statistically significant (not due to random chance).
 */
function twoProportionZTest(mean1, n1, mean2, n2) {
  // We need at least a small baseline sample size in both variations to compute
  if (n1 < 2 || n2 < 2) return { zScore: 0, pValue: 1, isSignificant: false };

  // 1. Calculate pooled proportion
  const pooled = (mean1 * n1 + mean2 * n2) / (n1 + n2);
  
  // 2. Calculate standard error
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (se === 0) return { zScore: 0, pValue: 1, isSignificant: false };

  // 3. Calculate Z-Score
  const zScore = (mean1 - mean2) / se;

  // 4. Compute two-tailed p-value using a standard normal distribution error approximation
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  return {
    zScore: parseFloat(zScore.toFixed(4)),
    pValue: parseFloat(pValue.toFixed(4)),
    isSignificant: pValue < 0.05, // p < 0.05 is the academic benchmark for significance
    confidenceLevel: parseFloat((1 - pValue).toFixed(4)),
  };
}

// Math approximation of a normal distribution CDF (Error Function method)
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * x);
  const d = 0.3989422820 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return 1 - p;
}

module.exports = { twoProportionZTest };