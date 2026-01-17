import express from 'express';
import { DatabaseService } from '../services/database';

const router = express.Router();
const db = new DatabaseService();

// Slow analytics endpoint (demonstrates performance tracking)
router.get('/slow', async (req, res) => {
  try {
    console.log('Starting slow analytics operation...');
    
    // Simulate complex data processing
    const startTime = Date.now();
    
    // Phase 1: Data collection (slow)
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = await db.getUsers();
    
    // Phase 2: Data aggregation (slower)
    await new Promise(resolve => setTimeout(resolve, 1200));
    const orders = await db.getOrders({});
    
    // Phase 3: Complex calculations (slowest)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analytics = {
      totalUsers: users.length,
      totalOrders: orders.length,
      averageOrderValue: orders.reduce((sum, order) => sum + order.total, 0) / orders.length || 0,
      userOrderRatio: orders.length / users.length || 0,
      processingTime: Date.now() - startTime,
      timestamp: Date.now()
    };

    console.log(`Analytics completed in ${analytics.processingTime}ms`);

    res.json({
      success: true,
      data: analytics,
      message: 'Analytics generated successfully (slow operation)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Analytics processing failed'
    });
  }
});

// Error simulation endpoint
router.get('/error', async (req, res) => {
  try {
    const errorType = req.query.type as string || 'random';
    
    switch (errorType) {
      case 'timeout':
        // Simulate timeout error
        await new Promise(resolve => setTimeout(resolve, 5000));
        break;
        
      case 'database':
        // Simulate database error
        throw new Error('Database connection failed');
        
      case 'validation':
        // Simulate validation error
        throw new Error('Invalid data format');
        
      case 'network':
        // Simulate network error
        throw new Error('External service unavailable');
        
      default:
        // Random error
        const errors = [
          'Unexpected null reference',
          'Memory allocation failed',
          'Configuration not found',
          'Service temporarily unavailable'
        ];
        throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }

    // This should never be reached
    res.json({
      success: true,
      message: 'No error occurred'
    });
  } catch (error) {
    console.error('Simulated error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Simulated error',
      errorType: req.query.type || 'random',
      timestamp: Date.now()
    });
  }
});

// Memory intensive operation
router.get('/memory', async (req, res) => {
  try {
    const size = parseInt(req.query.size as string) || 1000;
    
    console.log(`Starting memory intensive operation (size: ${size})...`);
    
    // Create large data structures
    const largeArray = new Array(size * 1000).fill(0).map((_, i) => ({
      id: i,
      data: `Item ${i}`,
      timestamp: Date.now(),
      metadata: {
        processed: false,
        priority: Math.floor(Math.random() * 10),
        tags: [`tag-${i % 100}`, `category-${i % 50}`]
      }
    }));

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Process data (CPU intensive)
    const processed = largeArray.map(item => ({
      ...item,
      metadata: {
        ...item.metadata,
        processed: true,
        processedAt: Date.now()
      }
    }));

    res.json({
      success: true,
      data: {
        itemsProcessed: processed.length,
        memoryUsed: `~${(processed.length * 200)} bytes`,
        processingComplete: true
      },
      message: 'Memory intensive operation completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Memory operation failed'
    });
  }
});

// CPU intensive operation
router.get('/cpu', async (req, res) => {
  try {
    const iterations = parseInt(req.query.iterations as string) || 1000000;
    
    console.log(`Starting CPU intensive operation (${iterations} iterations)...`);
    
    const startTime = Date.now();
    
    // CPU intensive calculation
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    res.json({
      success: true,
      data: {
        result: result.toFixed(6),
        iterations,
        duration,
        operationsPerSecond: Math.round(iterations / (duration / 1000))
      },
      message: 'CPU intensive operation completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'CPU operation failed'
    });
  }
});

// Real-time analytics dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const users = await db.getUsers();
    const orders = await db.getOrders({});
    
    // Simulate real-time calculations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const recentOrders = orders.filter(order => order.createdAt > hourAgo);
    
    const dashboard = {
      metrics: {
        totalUsers: users.length,
        totalOrders: orders.length,
        recentOrders: recentOrders.length,
        revenue: orders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: orders.reduce((sum, order) => sum + order.total, 0) / orders.length || 0
      },
      trends: {
        ordersPerHour: recentOrders.length,
        topUsers: users.slice(0, 5),
        orderStatuses: orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      timestamp: now
    };

    res.json({
      success: true,
      data: dashboard,
      message: 'Dashboard data generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Dashboard generation failed'
    });
  }
});

export default router;
