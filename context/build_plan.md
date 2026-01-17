Phase 1: Runtime signal ingestion
- Frontend SDK captures Web Vitals, resource timing, long tasks
- Backend agent captures OpenTelemetry traces
- Dependency snapshots captured at runtime

Phase 2: Causal graph construction
- Convert traces into a directed dependency graph
- Identify blocking relationships and critical paths

Phase 3: Performance analysis
- Compute user-perceived delay contributors
- Rank causes by impact

Phase 4: Security analysis
- Pull CVEs from public databases
- Match vulnerabilities to dependency versions
- Determine if vulnerable code executed in real requests

Phase 5: Developer interface
- Web dashboard for exploration and understanding
- CLI for summaries and enforcement in workflows
