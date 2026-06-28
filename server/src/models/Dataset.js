const mongoose = require('mongoose');

const DatasetEntrySchema = new mongoose.Schema({
  traceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trace' },
  input: [{
    role: { type: String, enum: ['system', 'user', 'assistant'] },
    content: String,
  }],
  expectedOutput: { type: String },    // optional ground truth
  tags: [String],
}, { _id: false });

const DatasetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  entries: [DatasetEntrySchema],
  entryCount: { type: Number, default: 0 },

  // Replay results
  replays: [{
    promptVersion: String,
    model: String,
    runAt: Date,
    avgCompositeScore: Number,
    avgLatencyMs: Number,
    totalCostUsd: Number,
  }],

}, { timestamps: true });

module.exports = mongoose.model('Dataset', DatasetSchema);