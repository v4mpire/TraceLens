# TraceLens MCP Server Integration

## Quick Setup

1. **Install the MCP server globally:**
   ```bash
   npm install -g @tracelens/mcp-server
   ```

2. **Add to Kiro CLI configuration:**
   ```bash
   # Add to .kiro/settings/mcp.json
   {
     "mcpServers": {
       "tracelens": {
         "command": "tracelens-mcp",
         "args": ["--endpoint", "http://localhost:3001", "--project", "my-app"]
       }
     }
   }
   ```

3. **Start using with AI tools:**
   ```bash
   kiro-cli "What are my app's current performance bottlenecks?"
   ```

## Available Commands

- **Performance Analysis**: `get_performance_bottlenecks`
- **Dependency Mapping**: `analyze_dependency_graph`  
- **Security Insights**: `get_security_insights`
- **Trace Querying**: `query_traces`
- **Health Monitoring**: `get_application_health`

## Example Workflows

### Debug Performance Issues
```bash
kiro-cli "My API is slow, what's the bottleneck?"
# Uses get_performance_bottlenecks to identify slow operations
```

### Understand Dependencies
```bash
kiro-cli "Show me how my checkout process works"
# Uses analyze_dependency_graph to map the flow
```

### Security Assessment
```bash
kiro-cli "What security risks should I fix first?"
# Uses get_security_insights to prioritize vulnerabilities
```

This MCP server makes TraceLens data directly accessible to AI coding assistants, enabling natural language queries about your application's runtime behavior.
