import express from 'express';
import { DatabaseService } from '../services/database';

const router = express.Router();
const db = new DatabaseService();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { userId, status, limit = 10 } = req.query;
    const orders = await db.getOrders({
      userId: userId ? parseInt(userId as string) : undefined,
      status: status as string,
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.getOrderById(parseInt(id));
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order'
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, total } = req.body;
    
    if (!userId || !items || !total) {
      return res.status(400).json({
        success: false,
        error: 'userId, items, and total are required'
      });
    }

    // Simulate order processing delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const order = await db.createOrder({ userId, items, total });
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const order = await db.updateOrderStatus(parseInt(id), status);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status'
    });
  }
});

// Process order (simulate complex operation)
router.post('/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulate complex order processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate payment processing
    const paymentResult = await simulatePaymentProcessing();
    
    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Payment processing failed',
        details: paymentResult.error
      });
    }

    // Update order status
    const order = await db.updateOrderStatus(parseInt(id), 'processed');
    
    res.json({
      success: true,
      data: order,
      message: 'Order processed successfully',
      paymentId: paymentResult.paymentId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process order'
    });
  }
});

// Simulate payment processing
async function simulatePaymentProcessing(): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate 90% success rate
  if (Math.random() > 0.1) {
    return {
      success: true,
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } else {
    return {
      success: false,
      error: 'Payment gateway timeout'
    };
  }
}

export default router;
