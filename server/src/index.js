const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
// Import routes cleanly from their absolute relative position to index.js
const authRoutes = require('./routes/auth');
const traceRoutes = require('./routes/traces');
const evaluationRoutes = require('./routes/evaluations');
const experimentRoutes = require('./routes/experiments');
const datasetRoutes = require('./routes/datasets');

// Import background workers (starts them listening to Redis)
require('./workers/traceWorker');
require('./workers/evalWorker');
require('./workers/alertWorker');

const app = express();

// Connect to MongoDB
connectDB();

// Core safety and data parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount standard API Endpoint routers
app.use('/api/auth', authRoutes);
app.use('/api/traces', traceRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/datasets', datasetRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Global error handling middleware catch-all
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));