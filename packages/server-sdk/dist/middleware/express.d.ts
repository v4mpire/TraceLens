import { Request, Response, NextFunction } from 'express';
import { TraceLensServerSDK, ServerSDKConfig } from '../core/tracer';
export interface TraceLensExpressOptions extends Partial<ServerSDKConfig> {
    ignorePaths?: string[];
    ignoreIncomingRequestHook?: (req: Request) => boolean;
    requestHook?: (span: any, req: Request) => void;
    responseHook?: (span: any, res: Response) => void;
}
export declare function createTraceLensMiddleware(options?: TraceLensExpressOptions): (req: Request, res: Response, next: NextFunction) => void;
export declare function getTraceLensSDK(): TraceLensServerSDK | null;
export declare function traced(target: any, propertyName: string, descriptor: PropertyDescriptor): PropertyDescriptor;
//# sourceMappingURL=express.d.ts.map