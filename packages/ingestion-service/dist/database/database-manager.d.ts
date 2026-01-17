import { PoolClient, QueryResult } from 'pg';
import { PerformanceEvent, Trace } from '@tracelens/shared';
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    maxConnections?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}
export declare class DatabaseManager {
    private pool;
    constructor(config: DatabaseConfig);
    query<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    getClient(): Promise<PoolClient>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
    isHealthy(): Promise<boolean>;
    createProject(name: string, apiKey: string): Promise<string>;
    getProjectByApiKey(apiKey: string): Promise<{
        id: string;
        name: string;
    } | null>;
    insertPerformanceEvent(projectId: string, event: PerformanceEvent): Promise<void>;
    insertPerformanceEventBatch(projectId: string, events: PerformanceEvent[]): Promise<void>;
    insertTrace(projectId: string, trace: Trace): Promise<void>;
    insertDependencySnapshot(projectId: string, snapshot: any): Promise<void>;
    insertCVERecord(cve: any): Promise<void>;
    getTracesByProject(projectId: string, limit?: number, offset?: number): Promise<Trace[]>;
    getPerformanceEventsByProject(projectId: string, eventType?: string, limit?: number, offset?: number): Promise<PerformanceEvent[]>;
}
//# sourceMappingURL=database-manager.d.ts.map