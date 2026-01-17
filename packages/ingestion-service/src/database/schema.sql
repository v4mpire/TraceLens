-- TraceLens database schema
-- PostgreSQL 14+ required

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Performance events table
CREATE TABLE performance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp BIGINT NOT NULL,
    url TEXT NOT NULL,
    user_agent TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Traces table
CREATE TABLE traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    trace_id VARCHAR(64) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    duration BIGINT,
    root_span_id VARCHAR(32),
    span_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spans table
CREATE TABLE spans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    trace_id VARCHAR(64) NOT NULL,
    span_id VARCHAR(32) NOT NULL,
    parent_span_id VARCHAR(32),
    operation_name VARCHAR(255) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    duration BIGINT,
    tags JSONB DEFAULT '{}'::jsonb,
    logs JSONB,
    status VARCHAR(50) DEFAULT 'OK',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dependencies table (for runtime dependency tracking)
CREATE TABLE dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    type VARCHAR(50) NOT NULL, -- 'npm', 'pip', 'gem', etc.
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Dependency snapshots (point-in-time dependency state)
CREATE TABLE dependency_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    trace_id VARCHAR(64),
    span_id VARCHAR(32),
    dependencies JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CVE records table
CREATE TABLE cve_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cve_id VARCHAR(50) UNIQUE NOT NULL,
    published_date TIMESTAMP WITH TIME ZONE,
    modified_date TIMESTAMP WITH TIME ZONE,
    severity VARCHAR(20),
    score DECIMAL(3,1),
    vector_string TEXT,
    description TEXT,
    affected_packages JSONB NOT NULL,
    references JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security assessments (CVE to runtime mapping)
CREATE TABLE security_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    cve_id VARCHAR(50) NOT NULL,
    dependency_name VARCHAR(255) NOT NULL,
    dependency_version VARCHAR(100),
    risk_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    runtime_exposure BOOLEAN DEFAULT FALSE,
    execution_paths JSONB,
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' -- 'active', 'resolved', 'ignored'
);

-- Indexes for performance
CREATE INDEX idx_performance_events_project_timestamp ON performance_events(project_id, timestamp DESC);
CREATE INDEX idx_performance_events_type ON performance_events(event_type);
CREATE INDEX idx_performance_events_url ON performance_events USING gin(url gin_trgm_ops);

CREATE INDEX idx_traces_project_id ON traces(project_id);
CREATE INDEX idx_traces_trace_id ON traces(trace_id);
CREATE INDEX idx_traces_start_time ON traces(start_time DESC);

CREATE INDEX idx_spans_project_id ON spans(project_id);
CREATE INDEX idx_spans_trace_id ON spans(trace_id);
CREATE INDEX idx_spans_span_id ON spans(span_id);
CREATE INDEX idx_spans_parent_span_id ON spans(parent_span_id);
CREATE INDEX idx_spans_operation_name ON spans(operation_name);
CREATE INDEX idx_spans_start_time ON spans(start_time DESC);
CREATE INDEX idx_spans_tags ON spans USING gin(tags);

CREATE INDEX idx_dependencies_project_name ON dependencies(project_id, name);
CREATE INDEX idx_dependencies_type ON dependencies(type);

CREATE INDEX idx_dependency_snapshots_project_id ON dependency_snapshots(project_id);
CREATE INDEX idx_dependency_snapshots_trace_id ON dependency_snapshots(trace_id);

CREATE INDEX idx_cve_records_cve_id ON cve_records(cve_id);
CREATE INDEX idx_cve_records_severity ON cve_records(severity);
CREATE INDEX idx_cve_records_score ON cve_records(score DESC);
CREATE INDEX idx_cve_records_affected_packages ON cve_records USING gin(affected_packages);

CREATE INDEX idx_security_assessments_project_id ON security_assessments(project_id);
CREATE INDEX idx_security_assessments_cve_id ON security_assessments(cve_id);
CREATE INDEX idx_security_assessments_risk_level ON security_assessments(risk_level);
CREATE INDEX idx_security_assessments_runtime_exposure ON security_assessments(runtime_exposure);

-- Composite indexes for common queries
CREATE INDEX idx_spans_trace_parent ON spans(trace_id, parent_span_id);
CREATE INDEX idx_performance_events_project_type_time ON performance_events(project_id, event_type, timestamp DESC);
CREATE INDEX idx_security_assessments_project_risk ON security_assessments(project_id, risk_level, runtime_exposure);

-- Unique constraints
ALTER TABLE performance_events ADD CONSTRAINT unique_event_per_project UNIQUE(project_id, event_id);
ALTER TABLE spans ADD CONSTRAINT unique_span_per_trace UNIQUE(trace_id, span_id);
ALTER TABLE dependencies ADD CONSTRAINT unique_dependency_per_project UNIQUE(project_id, name, version);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cve_records_updated_at BEFORE UPDATE ON cve_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Partitioning for large tables (optional, for high-volume deployments)
-- Partition performance_events by month
-- CREATE TABLE performance_events_template (LIKE performance_events INCLUDING ALL);
-- SELECT create_monthly_partitions('performance_events', '2024-01-01', '2025-12-31');

-- Views for common queries
CREATE VIEW trace_summary AS
SELECT 
    t.id,
    t.project_id,
    t.trace_id,
    t.start_time,
    t.end_time,
    t.duration,
    t.span_count,
    s.operation_name as root_operation,
    s.status as root_status
FROM traces t
LEFT JOIN spans s ON t.trace_id = s.trace_id AND t.root_span_id = s.span_id;

CREATE VIEW dependency_usage AS
SELECT 
    d.project_id,
    d.name,
    d.version,
    d.type,
    COUNT(ds.id) as usage_count,
    MAX(ds.created_at) as last_used
FROM dependencies d
LEFT JOIN dependency_snapshots ds ON d.project_id = ds.project_id 
    AND ds.dependencies @> jsonb_build_array(jsonb_build_object('name', d.name, 'version', d.version))
GROUP BY d.project_id, d.name, d.version, d.type;

CREATE VIEW security_risk_summary AS
SELECT 
    sa.project_id,
    sa.risk_level,
    COUNT(*) as vulnerability_count,
    COUNT(*) FILTER (WHERE sa.runtime_exposure = true) as runtime_exposed_count,
    COUNT(*) FILTER (WHERE sa.status = 'active') as active_count
FROM security_assessments sa
GROUP BY sa.project_id, sa.risk_level;
