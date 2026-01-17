import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { TraceLensServerSDK, ServerSDKConfig } from '../core/tracer';
export interface TraceLensFastifyOptions extends Partial<ServerSDKConfig> {
    ignorePaths?: string[];
    ignoreIncomingRequestHook?: (req: FastifyRequest) => boolean;
    requestHook?: (span: any, req: FastifyRequest) => void;
    responseHook?: (span: any, reply: FastifyReply) => void;
}
declare const _default: FastifyPluginAsync<TraceLensFastifyOptions>;
export default _default;
declare module 'fastify' {
    interface FastifyRequest {
        traceLensSpan?: any;
        traceLensStartTime?: bigint;
        traceLens: {
            createSpan: (name: string, attributes?: Record<string, string | number | boolean>) => any;
            getCurrentSpan: () => any;
            addAttribute: (key: string, value: string | number | boolean) => void;
        };
    }
    interface FastifyInstance {
        traceLensSDK: TraceLensServerSDK;
    }
}
//# sourceMappingURL=fastify.d.ts.map