TraceLens is a runtime truth engine for modern web applications.

Most observability tools show metrics and events. TraceLens focuses on causality. It determines what actually blocked users and why, by reconstructing execution order from real runtime signals.

TraceLens combines frontend performance timing, backend execution traces, and dependency information into a causal dependency graph. This graph is used to identify critical paths, performance regressions, and security exposure based on actual execution, not static analysis.

The core goal is to replace guesswork with deterministic explanations:
- why the page felt slow
- which code paths mattered
- which vulnerabilities are real risks in production
