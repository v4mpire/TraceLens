"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
// Database connection and query utilities
const pg_1 = require("pg");
class DatabaseManager {
    constructor(config) {
        this.pool = new pg_1.Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.username,
            password: config.password,
            ssl: config.ssl ? { rejectUnauthorized: false } : false,
            max: config.maxConnections || 20,
            idleTimeoutMillis: config.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
        });
        // Handle pool errors
        this.pool.on('error', (err) => {
            console.error('Database pool error:', err);
        });
    }
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            if (duration > 1000) {
                console.warn(`Slow query detected (${duration}ms):`, text);
            }
            return result;
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
    async getClient() {
        return this.pool.connect();
    }
    async transaction(callback) {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
    // Health check
    async isHealthy() {
        try {
            const result = await this.query('SELECT 1 as health');
            return result.rows.length === 1 && result.rows[0].health === 1;
        }
        catch {
            return false;
        }
    }
    // Project management
    async createProject(name, apiKey) {
        const result = await this.query('INSERT INTO projects (name, api_key) VALUES ($1, $2) RETURNING id', [name, apiKey]);
        return result.rows[0].id;
    }
    async getProjectByApiKey(apiKey) {
        const result = await this.query('SELECT id, name FROM projects WHERE api_key = $1', [apiKey]);
        return result.rows[0] || null;
    }
    // Performance events
    async insertPerformanceEvent(projectId, event) {
        await this.query(`INSERT INTO performance_events 
       (project_id, event_id, event_type, timestamp, url, user_agent, data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (project_id, event_id) DO UPDATE SET
       timestamp = EXCLUDED.timestamp,
       data = EXCLUDED.data`, [projectId, event.id, event.type, event.timestamp, event.url, event.userAgent, JSON.stringify(event.data)]);
    }
    async insertPerformanceEventBatch(projectId, events) {
        if (events.length === 0)
            return;
        const values = events.map((event, index) => {
            const baseIndex = index * 6;
            return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7})`;
        }).join(', ');
        const params = events.flatMap(event => [
            projectId, event.id, event.type, event.timestamp, event.url, event.userAgent, JSON.stringify(event.data)
        ]);
        await this.query(`INSERT INTO performance_events 
       (project_id, event_id, event_type, timestamp, url, user_agent, data) 
       VALUES ${values}
       ON CONFLICT (project_id, event_id) DO UPDATE SET
       timestamp = EXCLUDED.timestamp,
       data = EXCLUDED.data`, params);
    }
    // Traces and spans
    async insertTrace(projectId, trace) {
        await this.transaction(async (client) => {
            // Insert trace
            await client.query(`INSERT INTO traces 
         (project_id, trace_id, start_time, end_time, duration, root_span_id, span_count) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (trace_id) DO UPDATE SET
         end_time = EXCLUDED.end_time,
         duration = EXCLUDED.duration,
         span_count = EXCLUDED.span_count`, [
                projectId,
                trace.traceId,
                trace.startTime,
                trace.endTime,
                trace.duration,
                trace.rootSpan?.spanId,
                trace.spans.length
            ]);
            // Insert spans
            for (const span of trace.spans) {
                await client.query(`INSERT INTO spans 
           (project_id, trace_id, span_id, parent_span_id, operation_name, start_time, end_time, duration, tags, logs, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (trace_id, span_id) DO UPDATE SET
           end_time = EXCLUDED.end_time,
           duration = EXCLUDED.duration,
           tags = EXCLUDED.tags,
           logs = EXCLUDED.logs,
           status = EXCLUDED.status`, [
                    projectId,
                    span.traceId,
                    span.spanId,
                    span.parentSpanId,
                    span.operationName,
                    span.startTime,
                    span.endTime,
                    span.duration,
                    JSON.stringify(span.tags || {}),
                    span.logs ? JSON.stringify(span.logs) : null,
                    span.status
                ]);
            }
        });
    }
    // Dependencies
    async insertDependencySnapshot(projectId, snapshot) {
        await this.query(`INSERT INTO dependency_snapshots 
       (project_id, trace_id, span_id, dependencies) 
       VALUES ($1, $2, $3, $4)`, [projectId, snapshot.traceId, snapshot.spanId, JSON.stringify(snapshot.dependencies)]);
        // Update dependencies table
        for (const dep of snapshot.dependencies) {
            await this.query(`INSERT INTO dependencies 
         (project_id, name, version, type, first_seen, last_seen, metadata) 
         VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
         ON CONFLICT (project_id, name, version) DO UPDATE SET
         last_seen = NOW(),
         metadata = EXCLUDED.metadata`, [projectId, dep.name, dep.version, dep.type, JSON.stringify(dep.metadata || {})]);
        }
    }
    // CVE records
    async insertCVERecord(cve) {
        await this.query(`INSERT INTO cve_records 
       (cve_id, published_date, modified_date, severity, score, vector_string, description, affected_packages, references) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (cve_id) DO UPDATE SET
       modified_date = EXCLUDED.modified_date,
       severity = EXCLUDED.severity,
       score = EXCLUDED.score,
       vector_string = EXCLUDED.vector_string,
       description = EXCLUDED.description,
       affected_packages = EXCLUDED.affected_packages,
       references = EXCLUDED.references,
       updated_at = NOW()`, [
            cve.id,
            cve.published,
            cve.modified,
            cve.severity,
            cve.score,
            cve.vectorString,
            cve.descriptions?.[0]?.value || cve.description,
            JSON.stringify(cve.affectedPackages || []),
            JSON.stringify(cve.references || [])
        ]);
    }
    // Query methods
    async getTracesByProject(projectId, limit = 100, offset = 0) {
        const result = await this.query(`SELECT t.*, 
       json_agg(
         json_build_object(
           'traceId', s.trace_id,
           'spanId', s.span_id,
           'parentSpanId', s.parent_span_id,
           'operationName', s.operation_name,
           'startTime', s.start_time,
           'endTime', s.end_time,
           'duration', s.duration,
           'tags', s.tags,
           'logs', s.logs,
           'status', s.status
         ) ORDER BY s.start_time
       ) as spans
       FROM traces t
       LEFT JOIN spans s ON t.trace_id = s.trace_id
       WHERE t.project_id = $1
       GROUP BY t.id, t.trace_id, t.start_time, t.end_time, t.duration, t.root_span_id, t.span_count
       ORDER BY t.start_time DESC
       LIMIT $2 OFFSET $3`, [projectId, limit, offset]);
        return result.rows.map(row => ({
            traceId: row.trace_id,
            spans: row.spans.filter((span) => span.spanId !== null),
            startTime: row.start_time,
            endTime: row.end_time,
            duration: row.duration,
            rootSpan: row.spans.find((span) => span.spanId === row.root_span_id)
        }));
    }
    async getPerformanceEventsByProject(projectId, eventType, limit = 100, offset = 0) {
        const whereClause = eventType
            ? 'WHERE project_id = $1 AND event_type = $2'
            : 'WHERE project_id = $1';
        const params = eventType ? [projectId, eventType, limit, offset] : [projectId, limit, offset];
        const limitOffset = eventType ? '$3 OFFSET $4' : '$2 OFFSET $3';
        const result = await this.query(`SELECT event_id, event_type, timestamp, url, user_agent, data
       FROM performance_events
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT ${limitOffset}`, params);
        return result.rows.map(row => ({
            id: row.event_id,
            type: row.event_type,
            timestamp: row.timestamp,
            url: row.url,
            userAgent: row.user_agent,
            data: row.data
        }));
    }
}
exports.DatabaseManager = DatabaseManager;
