// Mock database service for demonstration
export class DatabaseService {
  private users: any[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: Date.now() - 86400000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: Date.now() - 172800000 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', createdAt: Date.now() - 259200000 }
  ];

  private orders: any[] = [
    { id: 1, userId: 1, items: ['item1', 'item2'], total: 99.99, status: 'completed', createdAt: Date.now() - 3600000 },
    { id: 2, userId: 2, items: ['item3'], total: 49.99, status: 'pending', createdAt: Date.now() - 7200000 },
    { id: 3, userId: 1, items: ['item4', 'item5', 'item6'], total: 149.99, status: 'processing', createdAt: Date.now() - 10800000 }
  ];

  private nextUserId = 4;
  private nextOrderId = 4;

  // User operations
  async getUsers(): Promise<any[]> {
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...this.users];
  }

  async getUserById(id: number): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 30));
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: { name: string; email: string; role?: string }): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = {
      id: this.nextUserId++,
      ...userData,
      role: userData.role || 'user',
      createdAt: Date.now()
    };
    
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, updates: any): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 80));
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 60));
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }

  // Order operations
  async getOrders(filters: { userId?: number; status?: string; limit?: number } = {}): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 70));
    
    let filteredOrders = [...this.orders];
    
    if (filters.userId) {
      filteredOrders = filteredOrders.filter(order => order.userId === filters.userId);
    }
    
    if (filters.status) {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }
    
    if (filters.limit) {
      filteredOrders = filteredOrders.slice(0, filters.limit);
    }
    
    return filteredOrders;
  }

  async getOrderById(id: number): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 40));
    return this.orders.find(order => order.id === id) || null;
  }

  async createOrder(orderData: { userId: number; items: string[]; total: number }): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const order = {
      id: this.nextOrderId++,
      ...orderData,
      status: 'pending',
      createdAt: Date.now()
    };
    
    this.orders.push(order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 90));
    
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;
    
    this.orders[orderIndex].status = status;
    return this.orders[orderIndex];
  }

  // Simulate complex database operations
  async performComplexQuery(): Promise<any> {
    // Simulate heavy database operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      userStats: this.users.length,
      orderStats: this.orders.length,
      revenueStats: this.orders.reduce((sum, order) => sum + order.total, 0)
    };
  }

  async simulateSlowQuery(): Promise<any> {
    // Simulate very slow database operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      message: 'Slow query completed',
      executionTime: '2000ms',
      rowsProcessed: this.users.length + this.orders.length
    };
  }
}
