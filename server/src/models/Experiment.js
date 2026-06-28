const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  variantId: { type: String, required: true },   // e.g. "control", "variant-a"
  name: { type: String, required: true },
  systemPrompt: { type: String, required: true },
  trafficWeight: { type: Number, default: 0.5 }, // 0.0 to 1.0, must sum to 1 across variants

  // Live stats (updated after each evaluation)
  stats: {
    callCount: { type: Number, default: 0 },
    avgCompositeScore: { type: Number, default: 0 },
    avgLatencyMs: { type: Number, default: 0 },
    avgCostUsd: { type: Number, default: 0 },
  }
}, { _id: false });

const ExperimentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  variants: [VariantSchema],

  status: { type: String, enum: ['draft', 'running', 'paused', 'concluded'], default: 'draft' },

  // Statistical results (computed by alert worker)
  result: {
    winningVariantId: { type: String },
    pValue: { type: Number },           // p-value from Z-test
    isSignificant: { type: Boolean },   // p < 0.05?
    confidenceLevel: { type: Number },  // e.g. 0.95
    computedAt: { type: Date },
  },

  minSampleSize: { type: Number, default: 100 }, // before computing significance

}, { timestamps: true });

module.exports = mongoose.model('Experiment', ExperimentSchema);