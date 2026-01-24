# TraceLens MCP Server

Model Context Protocol server for TraceLens observability platform. Query your application's performance data, dependency graphs, and security insights directly through AI tools like Kiro CLI, Claude Code, and Cursor.

## Installation

```bash
npm install -g @tracelens/mcp-server
```

## Usage

### With Kiro CLI

Add to your `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": [
        "--endpoint", "http://localhost:3001",
        "--project", "my-app"
      ]
    }
  }
}
```

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": [
        "--endpoint", "http://localhost:3001",
        "--project", "my-app"
      ]
    }
  }
}
```

## Available Tools

### `get_performance_bottlenecks`
Identify current performance bottlenecks and slow operations.

**Parameters:**
- `timeRange` (string): Time range to analyze (1h, 24h, 7d) - default: "1h"
- `threshold` (number): Minimum duration threshold in milliseconds - default: 100

### `analyze_dependency_graph`
Get dependency graph analysis and critical path information.

**Parameters:**
- `operation` (string, optional): Specific operation to analyze

### `get_security_insights`
Get runtime security vulnerabilities and risk assessment.

**Parameters:**
- `severity` (string): Minimum severity level (low, medium, high, critical)

### `query_traces`
Search and filter execution traces.

**Parameters:**
- `operation` (string, optional): Operation name to filter by
- `status` (string, optional): Trace status filter (success, error)
- `minDuration` (number, optional): Minimum duration in milliseconds
- `limit` (number): Maximum number of traces to return - default: 10

### `get_application_health`
Get overall application health metrics and status.

**Parameters:**
- `includeMetrics` (boolean): Include detailed performance metrics - default: true

## Example Queries

### With Kiro CLI

```bash
kiro-cli "What are the current performance bottlenecks in my app?"
kiro-cli "Show me the dependency graph for the user authentication flow"
kiro-cli "What security vulnerabilities are actually being used at runtime?"
kiro-cli "Find all slow database queries from the last hour"
```

### With Claude Code

```
What's causing my API to be slow? Use TraceLens to analyze the bottlenecks.

Show me the critical path for my checkout process.

Are there any high-severity security issues I should fix immediately?
```

## Configuration

### Command Line Options

- `--endpoint <url>`: TraceLens API endpoint (default: http://localhost:3001)
- `--api-key <key>`: TraceLens API key (optional)
- `--project <id>`: Project ID to query (default: "default")

### Environment Variables

- `TRACELENS_ENDPOINT`: API endpoint
- `TRACELENS_API_KEY`: API key
- `TRACELENS_PROJECT_ID`: Project ID

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev

# Test
npm test
```

## License

MIT - see LICENSE file for details.
