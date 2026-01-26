# TraceLens MCP Server Integration

## Quick Setup

### 1. Install the MCP server globally:
```bash
npm install -g @tracelens/mcp-server
```

### 2. Add to Kiro CLI configuration:

<details>
<summary><strong>📝 Basic Configuration</strong></summary>

Add to `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": ["--endpoint", "http://localhost:3001", "--project", "my-app"]
    }
  }
}
```
</details>

<details>
<summary><strong>⚙️ Advanced Configuration</strong></summary>

```json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": [
        "--endpoint", "http://localhost:3001",
        "--project", "my-app",
        "--api-key", "your-api-key"
      ],
      "env": {
        "TRACELENS_LOG_LEVEL": "info"
      }
    }
  }
}
```
</details>

### 3. Start using with AI tools:
```bash
kiro-cli "What are my app's current performance bottlenecks?"
```

## Available Commands

<details>
<summary><strong>🔍 Performance Analysis</strong></summary>

**`get_performance_bottlenecks`**
- Identify current performance bottlenecks and slow operations
- Parameters: `timeRange` (1h, 24h, 7d), `threshold` (milliseconds)
- Example: "What operations are slower than 100ms in the last hour?"
</details>

<details>
<summary><strong>🕸️ Dependency Mapping</strong></summary>

**`analyze_dependency_graph`**
- Get dependency graph analysis and critical path information
- Parameters: `operation` (optional specific operation to analyze)
- Example: "Show me the dependency graph for user authentication"
</details>

<details>
<summary><strong>🛡️ Security Insights</strong></summary>

**`get_security_insights`**
- Get runtime security vulnerabilities and risk assessment
- Parameters: `severity` (low, medium, high, critical)
- Example: "What high-severity vulnerabilities are actually being used?"
</details>

<details>
<summary><strong>📊 Trace Querying</strong></summary>

**`query_traces`**
- Search and filter execution traces
- Parameters: `operation`, `status`, `minDuration`, `limit`
- Example: "Find all slow database queries from the last hour"
</details>

<details>
<summary><strong>💚 Health Monitoring</strong></summary>

**`get_application_health`**
- Get overall application health metrics and status
- Parameters: `includeMetrics` (boolean)
- Example: "What's the current health status of my application?"
</details>

## Example Workflows

<details>
<summary><strong>🐛 Debug Performance Issues</strong></summary>

```bash
kiro-cli "My API is slow, what's the bottleneck?"
# Uses get_performance_bottlenecks to identify slow operations

kiro-cli "Show me the critical path for my checkout process"
# Uses analyze_dependency_graph to map the flow

kiro-cli "What's blocking my users the most?"
# Combines performance and dependency analysis
```
</details>

<details>
<summary><strong>🔒 Security Assessment</strong></summary>

```bash
kiro-cli "What security risks should I fix first?"
# Uses get_security_insights to prioritize vulnerabilities

kiro-cli "Are there any critical vulnerabilities in my runtime?"
# Filters for high-severity issues that actually matter

kiro-cli "Which packages are creating security exposure?"
# Maps CVEs to actual runtime usage
```
</details>

<details>
<summary><strong>📈 Performance Monitoring</strong></summary>

```bash
kiro-cli "How is my application performing right now?"
# Uses get_application_health for current status

kiro-cli "Show me all errors from the last 24 hours"
# Uses query_traces with error status filter

kiro-cli "What's the slowest operation in my app?"
# Combines bottleneck analysis with trace querying
```
</details>

## Benefits

<details>
<summary><strong>💰 Cost Reduction</strong></summary>

**Before TraceLens MCP:**
- "My app is slow, help me debug" → Vague, expensive AI conversations
- Multiple back-and-forth messages to narrow down issues
- Generic solutions that might not work
- $50-100/month in wasted AI credits

**After TraceLens MCP:**
- "How do I optimize this 340ms database query?" → Specific, targeted conversation
- One precise question with exact context
- AI gives solutions that actually work
- 80% reduction in AI debugging costs
</details>

<details>
<summary><strong>⏱️ Time Savings</strong></summary>

**Traditional Debugging:**
- 2-4 hours debugging performance issues
- Guessing which part of code is slow
- Testing multiple theories without data

**With TraceLens MCP:**
- 10-15 minutes to identify exact problem
- Direct path to the solution with causal analysis
- Immediate validation that fixes work
- 10-20 hours saved per month for active development
</details>

This MCP server makes TraceLens data directly accessible to AI coding assistants, enabling natural language queries about your application's runtime behavior and transforming how you debug with AI tools.
