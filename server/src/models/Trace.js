const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { _id: false });

const TraceSchema = new mongoose.Schema({
  // Identity
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, index: true },     // groups multi-turn agent runs
  traceId: { type: String, unique: true, required: true }, // client-generated UUID

  // The LLM call itself
  provider: { type: String, enum: ['openai', 'anthropic', 'google', 'other'], required: true },
  model: { type: String, required: true },      // e.g. "gpt-4o", "claude-3-5-sonnet"
  messages: [MessageSchema],
  response: { type: String, required: true },
  systemPrompt: { type: String },

  // Performance metrics
  latencyMs: { type: Number, required: true },
  promptTokens: { type: Number },
  completionTokens: { type: Number },
  totalTokens: { type: Number },
  estimatedCostUsd: { type: Number },

  // Experiment context (if part of an A/B test)
  experimentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experiment' },
  variantId: { type: String },

  // Status
  status: { type: String, enum: ['pending', 'evaluated', 'failed'], default: 'pending' },

  // Tags for filtering (developer-defined)
  tags: [{ type: String }],
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed }, // any extra context

}, { timestamps: true });

// Indexes for common query patterns
TraceSchema.index({ userId: 1, createdAt: -1 });
TraceSchema.index({ userId: 1, model: 1 });
TraceSchema.index({ experimentId: 1, variantId: 1 });
TraceSchema.index({ tags: 1 });

module.exports = mongoose.model('Trace', TraceSchema);