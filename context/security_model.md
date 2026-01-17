TraceLens follows a minimal-privilege ingestion model.

SDKs send only timing, execution metadata, and dependency identifiers. No user content or sensitive payloads are collected.

Projects are isolated by project keys. All data ingestion is authenticated.

TraceLens dogfoods its own dependency and CVE analysis to monitor its own runtime security posture.
