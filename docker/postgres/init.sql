-- TraceLens Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic tables for development
CREATE TABLE IF NOT EXISTS traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(255) NOT NULL,
    trace_id VARCHAR(255) NOT NULL,
    span_id VARCHAR(255) NOT NULL,
    parent_span_id VARCHAR(255),
    operation_name VARCHAR(255) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    duration BIGINT,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_traces_project_id ON traces(project_id);
CREATE INDEX idx_traces_trace_id ON traces(trace_id);
CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);
