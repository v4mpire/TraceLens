-- TraceLens Database Initialization
-- This script sets up the basic database schema for TraceLens

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create traces table
CREATE TABLE IF NOT EXISTS traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id VARCHAR(255) NOT NULL,
    span_id VARCHAR(255) NOT NULL,
    parent_span_id VARCHAR(255),
    operation_name VARCHAR(255) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    duration BIGINT,
    tags JSONB DEFAULT '{}',
    logs JSONB DEFAULT '[]',
    process JSONB DEFAULT '{}',
    warnings TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(trace_id, span_id)
);

-- Create performance events table
CREATE TABLE IF NOT EXISTS performance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    timestamp BIGINT NOT NULL,
    url TEXT,
    user_agent TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dependencies table
CREATE TABLE IF NOT EXISTS dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(name, version, type)
);

-- Create vulnerability mappings table
CREATE TABLE IF NOT EXISTS vulnerability_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dependency_id UUID REFERENCES dependencies(id) ON DELETE CASCADE,
    cve_id VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    affected_versions TEXT[],
    fixed_version VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_traces_trace_id ON traces(trace_id);
CREATE INDEX IF NOT EXISTS idx_traces_start_time ON traces(start_time);
CREATE INDEX IF NOT EXISTS idx_traces_operation_name ON traces(operation_name);
CREATE INDEX IF NOT EXISTS idx_traces_tags ON traces USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_performance_events_session_id ON performance_events(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_events_timestamp ON performance_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_events_type ON performance_events(event_type);

CREATE INDEX IF NOT EXISTS idx_dependencies_name ON dependencies(name);
CREATE INDEX IF NOT EXISTS idx_dependencies_type ON dependencies(type);

CREATE INDEX IF NOT EXISTS idx_vulnerability_mappings_dependency_id ON vulnerability_mappings(dependency_id);
CREATE INDEX IF NOT EXISTS idx_vulnerability_mappings_cve_id ON vulnerability_mappings(cve_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for traces table
DROP TRIGGER IF EXISTS update_traces_updated_at ON traces;
CREATE TRIGGER update_traces_updated_at
    BEFORE UPDATE ON traces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
INSERT INTO dependencies (name, version, type, metadata) VALUES
    ('react', '18.2.0', 'npm', '{"description": "React library"}'),
    ('express', '4.18.0', 'npm', '{"description": "Web framework"}'),
    ('next', '14.0.0', 'npm', '{"description": "React framework"}')
ON CONFLICT (name, version, type) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tracelens;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tracelens;
