import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { TraceLensSDK } from '@tracelens/server-sdk';

import userRoutes from './routes/users';
import orderRoutes from './routes/orders';
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize TraceLens SDK
const traceLens = new TraceLensSDK({
  projectKey: 'express-example-project',
  endpoint: 'http://localhost:3001/api/traces',
  debug: true
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Apply TraceLens middleware AFTER basic middleware but BEFORE routes
app.use(traceLens.middleware());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    service: 'tracelens-express-example',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TraceLens Express Example API',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check',
      'GET /api/users - List users',
      'POST /api/users - Create user',
      'GET /api/users/:id - Get user by ID',
      'GET /api/orders - List orders',
      'POST /api/orders - Create order',
      'GET /api/orders/:id - Get order by ID',
      'GET /api/analytics/slow - Slow analytics endpoint',
      'GET /api/analytics/error - Error simulation endpoint'
    ]
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      timestamp: Date.now()
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      status: 404,
      path: req.path,
      timestamp: Date.now()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TraceLens Express Example API running on port ${PORT}`);
  console.log(`📊 TraceLens tracking enabled`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}`);
});

export default app;
