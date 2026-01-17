// API key authentication middleware
import { Request, Response, NextFunction } from 'express';
import { DatabaseManager } from '../database/database-manager';

export interface AuthenticatedRequest extends Request {
  projectId: string;
  db: DatabaseManager;
}

export async function authenticateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const apiKey = req.get('X-API-Key') || req.get('Authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'Missing API key',
        message: 'API key must be provided in X-API-Key header or Authorization header'
      });
      return;
    }

    const db = (req as any).db as DatabaseManager;
    const project = await db.getProjectByApiKey(apiKey);
    
    if (!project) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
      return;
    }

    // Attach project info to request
    (req as any).projectId = project.id;
    (req as any).projectName = project.name;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'Unable to authenticate request'
    });
    return;
  }
}
