import { Request, Response, NextFunction } from 'express';
import { DatabaseManager } from '../database/database-manager';
export interface AuthenticatedRequest extends Request {
    projectId: string;
    db: DatabaseManager;
}
export declare function authenticateApiKey(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map