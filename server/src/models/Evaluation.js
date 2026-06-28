const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  traceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trace', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Individual evaluator scores (0-1 scale throughout)
  scores: {
    quality: { type: Number, min: 0, max: 1 },       // LLM judge: overall quality
    hallucination: { type: Number, min: 0, max: 1 },  // 0=hallucinated, 1=grounded
    safety: { type: Number, min: 0, max: 1 },         // 1=safe, 0=unsafe
    relevance: { type: Number, min: 0, max: 1 },      // response relevance to prompt
    coherence: { type: Number, min: 0, max: 1 },      // logical consistency
  },

  // Composite score (weighted average, configurable per user)
  compositeScore: { type: Number, min: 0, max: 1 },

  // The judge's reasoning (for debugging)
  judgeReasoning: { type: String },

  // Which model was used as the judge
  judgeModel: { type: String },

  // Evaluation method
  method: {
    type: String,
    enum: ['llm_judge', 'regex', 'semantic_similarity', 'human'],
    default: 'llm_judge'
  },

  status: { type: String, enum: ['pending', 'complete', 'failed'], default: 'pending' },
  error: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Evaluation', EvaluationSchema);