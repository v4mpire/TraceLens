# TraceLens API Documentation

Complete API reference for TraceLens Runtime Truth Engine.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All API requests require a project key in the Authorization header:
```
Authorization: Bearer your-project-key
```

## Endpoints

### Health Check
```http
GET /health
```
Returns system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1705593600000,
  "service": "tracelens-dashboard",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Event Ingestion
```http
POST /events
```
Ingest performance events from browser SDK.

**Request Body:**
```json
{
  "projectKey": "your-project-key",
  "events": [
    {
      "id": "event-123",
      "timestamp": 1705593600000,
      "type": "web-vitals",
      "data": {
        "name": "LCP",
        "value": 1200,
        "rating": "good"
      }
    }
  ]
}
```

### Trace Ingestion
```http
POST /traces
```
Ingest trace data from server SDK.

**Request Body:**
```json
{
  "projectKey": "your-project-key",
  "traces": [
    {
      "traceId": "trace-123",
      "spans": [
        {
          "spanId": "span-456",
          "operationName": "http_request",
          "startTime": 1705593600000,
          "duration": 150
        }
      ]
    }
  ]
}
```

### Get Traces
```http
GET /traces?projectId={projectId}
```
Retrieve traces for a project.

**Response:**
```json
{
  "data": [
    {
      "id": "trace-123",
      "timestamp": 1705593600000,
      "duration": 150,
      "spans": [...]
    }
  ],
  "success": true
}
```

### Performance Metrics
```http
GET /performance?projectId={projectId}
```
Get performance metrics for a project.

**Response:**
```json
{
  "data": [
    {
      "timestamp": 1705593600000,
      "metric": "response_time",
      "value": 150,
      "threshold": 200
    }
  ],
  "success": true
}
```

### Security Analysis
```http
GET /security?projectId={projectId}
```
Get security vulnerability analysis.

**Response:**
```json
{
  "data": [
    {
      "cve": "CVE-2023-1234",
      "severity": "high",
      "package": "example-package",
      "version": "1.0.0",
      "runtimeRelevant": true
    }
  ],
  "success": true
}
```

### Dependency Graph
```http
GET /analysis/graph/{traceId}
```
Get dependency graph for a specific trace.

**Response:**
```json
{
  "data": {
    "nodes": [
      {
        "id": "service-1",
        "name": "Frontend",
        "type": "service",
        "duration": 120
      }
    ],
    "links": [
      {
        "source": "service-1",
        "target": "service-2",
        "duration": 45
      }
    ]
  },
  "success": true
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": 1705593600000
}
```

## Rate Limits
- 1000 requests per minute per project
- 10,000 events per minute per project

## SDK Integration

See [Quick Start Guide](../QUICKSTART.md) for SDK integration examples.
