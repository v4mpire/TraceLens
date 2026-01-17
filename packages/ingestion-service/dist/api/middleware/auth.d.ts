import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    projectKey?: string;
    projectId?: string;
}
export declare class AuthMiddleware {
    private validApiKeys;
    constructor();
    authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
    optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
    requirePermission: (permission: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
    private extractApiKey;
    private loadApiKeys;
    refreshApiKeys(): void;
    getProjectInfo(apiKey: string): {
        projectId: string;
        name: string;
        permissions: string[];
    } | null;
    static isValidApiKeyFormat(apiKey: string): boolean;
}
export declare const authMiddleware: AuthMiddleware;
//# sourceMappingURL=auth.d.ts.map