
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data for demo
const mockTraces = [
  { id: '1', operation: '/api/users', duration: 340, status: 'slow', timestamp: Date.now() - 60000, spans: 5 },
  { id: '2', operation: '/api/auth/login', duration: 120, status: 'normal', timestamp: Date.now() - 30000, spans: 3 }
];

const mockBottlenecks = [{
  operation: '/api/users', avgDuration: 340, p95Duration: 450, impactPercentage: 85,
  rootCause: 'Database query without index', recommendation: 'Add index on user_id column'
}];

app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.get('/api/traces', (req, res) => res.json(mockTraces));
app.get('/api/performance/bottlenecks', (req, res) => res.json(mockBottlenecks));
app.post('/api/events', (req, res) => { console.log('Event:', req.body); res.json({ success: true }); });
app.post('/api/traces', (req, res) => { console.log('Trace:', req.body); res.json({ success: true }); });

app.listen(3001, () => console.log('🚀 TraceLens API running on http://localhost:3001'));
