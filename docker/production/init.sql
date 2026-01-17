-- Initialize TraceLens database schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    type VARCHAR(100) NOT NULL,
    timestamp BIGINT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Traces table
CREATE TABLE IF NOT EXISTS traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    trace_id VARCHAR(255) NOT NULL,
    span_id VARCHAR(255) NOT NULL,
    parent_span_id VARCHAR(255),
    operation_name VARCHAR(255) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT NOT NULL,
    duration BIGINT GENERATED ALWAYS AS (end_time - start_time) STORED,
    tags JSONB,
    dependencies JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dependencies table
CREATE TABLE IF NOT EXISTS dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    ecosystem VARCHAR(50),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CVEs table
CREATE TABLE IF NOT EXISTS cves (
    id VARCHAR(50) PRIMARY KEY,
    description TEXT,
    severity VARCHAR(20),
    score DECIMAL(3,1),
    published_date TIMESTAMP,
    modified_date TIMESTAMP,
    affected_packages JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_project_timestamp ON events(project_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_traces_project_trace ON traces(project_id, trace_id);
CREATE INDEX IF NOT EXISTS idx_traces_operation ON traces(operation_name);
CREATE INDEX IF NOT EXISTS idx_traces_duration ON traces(duration);
CREATE INDEX IF NOT EXISTS idx_dependencies_project ON dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_cves_severity ON cves(severity);

-- Insert default project for development
INSERT INTO projects (name, api_key) 
VALUES ('Default Project', 'default-project-key')
ON CONFLICT (api_key) DO NOTHING;
