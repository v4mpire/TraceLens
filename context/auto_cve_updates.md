TraceLens maintains an internal vulnerability index sourced from public CVE databases such as NVD and OSV.

A scheduled job periodically fetches new and updated CVEs and normalizes them by:
- affected package
- version ranges
- severity
- fixed versions

Runtime dependency snapshots from connected applications are matched against this index.

OpenTelemetry traces are used to determine whether vulnerable packages actually executed during real user requests. This allows TraceLens to distinguish between theoretical vulnerabilities and real production risk.
