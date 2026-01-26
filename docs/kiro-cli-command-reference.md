# Kiro CLI Command Reference for TraceLens Development

This document provides practical command templates and patterns used throughout TraceLens development, organized by development phase and use case.

## Command Templates by Development Phase

### Phase 1: Project Planning and Architecture

**Initial Project Planning**:
```bash
# High-level architecture planning
kiro-cli "Plan the complete architecture for TraceLens, a runtime observability platform. Include: monorepo structure, technology stack, database design, API architecture, and deployment strategy."

# Technology stack validation
kiro-cli "Evaluate technology choices for TraceLens: Next.js vs React, PostgreSQL vs MongoDB, Express vs Fastify, Docker vs native deployment. Provide recommendations with rationale."

# Database schema design
kiro-cli "Design PostgreSQL database schema for TraceLens trace storage. Requirements: high-throughput ingestion, efficient querying, time-series data, dependency relationships."
```

**Monorepo Structure Planning**:
```bash
# Package organization
kiro-cli "Design monorepo structure for TraceLens using Turborepo. Include: browser SDK, server SDK, dashboard, API service, shared packages, build coordination."

# Dependency management
kiro-cli "Plan dependency management strategy for TraceLens monorepo. Handle: shared types, version synchronization, build dependencies, deployment coordination."
```

### Phase 2: Core Implementation

**SDK Development**:
```bash
# Browser SDK
kiro-cli "Subagent Browser-SDK: Build TraceLens browser SDK with TypeScript. Features: Web Vitals integration, performance tracking, minimal overhead (<1ms), automatic instrumentation."

# Server SDK
kiro-cli "Subagent Server-SDK: Build TraceLens server SDK for Node.js/Express. Features: middleware integration, request tracing, dependency tracking, error capture."

# SDK coordination
kiro-cli "Coordinate browser and server SDK development. Ensure: consistent APIs, shared type definitions, compatible event formats, unified documentation."
```

**API Service Development**:
```bash
# Ingestion service
kiro-cli "Subagent API-Ingestion: Build high-throughput event ingestion service. Requirements: Express.js, PostgreSQL integration, <100ms response time, 10k+ events/second."

# Analysis engine
kiro-cli "Subagent Analysis-Engine: Build dependency graph analysis engine. Features: causal relationship detection, critical path analysis, performance bottleneck identification."
```

### Phase 3: User Interface Development

**Dashboard Development**:
```bash
# Core dashboard
kiro-cli "Subagent Dashboard-Core: Build Next.js 14 dashboard with TypeScript. Features: real-time trace visualization, performance metrics, system health monitoring."

# Real-time features
kiro-cli "Subagent Dashboard-Realtime: Add WebSocket integration for live updates. Requirements: automatic reconnection, event parsing, state synchronization, <100ms latency."

# Visualization components
kiro-cli "Subagent Dashboard-Charts: Build Chart.js components for performance visualization. Include: trace count charts, response time graphs, dependency visualizations."
```

**User Experience**:
```bash
# Onboarding system
kiro-cli "Subagent Onboarding: Create interactive 3-step user onboarding. Features: system health check, dashboard tour, integration guide with code generation."

# Self-monitoring demonstration
kiro-cli "Subagent Self-Monitoring: Implement TraceLens self-monitoring to demonstrate capabilities. Track: dashboard performance, API response times, system health."
```

### Phase 4: Integration and Polish

**Installation System**:
```bash
# Core installer
kiro-cli "Subagent Installer-Core: Build Python installation script with multiple modes. Features: standard/quick/demo/enhanced modes, port configuration, prerequisite checking."

# Rich UI installer
kiro-cli "Subagent Installer-UI: Add rich terminal interface with progress bars. Use rich library for: multi-stage progress, live updates, professional appearance."

# Service management
kiro-cli "Subagent Installer-Services: Handle Docker, PostgreSQL, Redis setup. Features: container management, health checking, port conflict resolution."
```

**AI Integration**:
```bash
# MCP server
kiro-cli "Subagent MCP-Server: Build Model Context Protocol server for TraceLens. Features: performance analysis tools, security insights, dependency graph queries."

# Natural language queries
kiro-cli "Subagent MCP-Queries: Implement natural language query handlers. Support: 'What are my performance bottlenecks?', 'Show security vulnerabilities', 'Optimize this query'."
```

## Subagent Coordination Patterns

### Pattern 1: Sequential Development Chain

**Use Case**: When tasks have clear dependencies

```bash
# Step 1: Foundation
kiro-cli "Subagent Foundation: Design database schema and TypeScript interfaces for TraceLens core data structures."

# Step 2: API Layer (depends on Step 1)
kiro-cli "Subagent API: Build REST API endpoints using the schema and interfaces from Foundation subagent."

# Step 3: Frontend (depends on Step 2)  
kiro-cli "Subagent Frontend: Build dashboard components consuming the API endpoints from API subagent."

# Step 4: Integration (depends on all previous)
kiro-cli "Subagent Integration: Integrate all components and validate end-to-end functionality."
```

### Pattern 2: Parallel Development with Coordination

**Use Case**: Independent components with shared contracts

```bash
# Define shared contracts first
kiro-cli "Define shared TypeScript interfaces and API contracts for TraceLens components. Include: event types, configuration interfaces, API schemas."

# Parallel development (can run simultaneously)
kiro-cli "Subagent Browser: Build browser SDK using shared contracts"
kiro-cli "Subagent Server: Build server SDK using shared contracts"  
kiro-cli "Subagent Dashboard: Build dashboard using shared contracts"
kiro-cli "Subagent API: Build ingestion API using shared contracts"

# Integration validation
kiro-cli "Validate integration of all parallel components. Test: API compatibility, event format consistency, end-to-end workflows."
```

### Pattern 3: Specialized Domain Experts

**Use Case**: Complex technical domains requiring deep expertise

```bash
# Database optimization expert
kiro-cli "Subagent Database-Expert: Optimize PostgreSQL for high-throughput trace ingestion. Focus on: indexing strategies, partitioning, query optimization, connection pooling."

# Security expert
kiro-cli "Subagent Security-Expert: Implement security best practices across TraceLens. Focus on: input validation, authentication, vulnerability scanning, secure defaults."

# Performance expert
kiro-cli "Subagent Performance-Expert: Optimize TraceLens for minimal overhead. Focus on: SDK performance, API response times, memory usage, CPU utilization."
```

## Quality Assurance Commands

### Testing Coordination

```bash
# Comprehensive testing
kiro-cli "Subagent Testing: Create comprehensive test suite for TraceLens. Include: unit tests, integration tests, performance tests, security tests."

# Cross-component testing
kiro-cli "Subagent Integration-Testing: Build integration tests validating component interactions. Test: SDK-API communication, dashboard-API integration, end-to-end workflows."

# Performance validation
kiro-cli "Subagent Performance-Testing: Validate TraceLens performance requirements. Test: <1ms SDK overhead, <100ms API response, 10k+ events/second throughput."
```

### Code Quality Validation

```bash
# Code review
kiro-cli "Review TraceLens codebase for: architectural consistency, code quality, security vulnerabilities, performance issues. Provide specific recommendations."

# Documentation validation
kiro-cli "Validate TraceLens documentation for: completeness, accuracy, clarity, code example correctness. Update as needed."

# TypeScript validation
kiro-cli "Validate TypeScript usage across TraceLens. Check: type safety, interface consistency, proper error handling, performance implications."
```

## Troubleshooting and Debugging Commands

### System Diagnosis

```bash
# Installation issues
kiro-cli "Diagnose TraceLens installation issues. Check: Docker status, database connections, port conflicts, dependency versions. Provide specific solutions."

# Runtime issues
kiro-cli "Diagnose TraceLens runtime issues. Check: API connectivity, WebSocket connections, database performance, memory usage. Identify root causes."

# Performance issues
kiro-cli "Diagnose TraceLens performance issues. Analyze: API response times, database query performance, frontend rendering, memory leaks."
```

### Development Environment

```bash
# Development setup
kiro-cli "Set up TraceLens development environment. Include: monorepo setup, dependency installation, database initialization, development server configuration."

# Build issues
kiro-cli "Diagnose TraceLens build issues. Check: TypeScript compilation, package dependencies, build configuration, deployment preparation."
```

## Documentation Generation Commands

### API Documentation

```bash
# API reference
kiro-cli "Generate comprehensive API documentation for TraceLens. Include: endpoint descriptions, request/response schemas, authentication, error codes, examples."

# SDK documentation
kiro-cli "Generate SDK documentation for TraceLens browser and server SDKs. Include: installation, configuration, API reference, integration examples, TypeScript definitions."
```

### User Guides

```bash
# Getting started guide
kiro-cli "Create TraceLens getting started guide. Include: installation steps, basic configuration, first trace collection, dashboard overview."

# Integration examples
kiro-cli "Create TraceLens integration examples for popular frameworks. Include: React, Vue, Express, Next.js, with complete working code."
```

## Deployment and Operations Commands

### Deployment Preparation

```bash
# Production deployment
kiro-cli "Prepare TraceLens for production deployment. Include: Docker configuration, environment variables, security hardening, performance optimization."

# Deployment validation
kiro-cli "Validate TraceLens production deployment. Check: service health, database connectivity, API functionality, security configuration."
```

### Monitoring and Maintenance

```bash
# Health monitoring
kiro-cli "Implement health monitoring for TraceLens production deployment. Include: service health checks, database monitoring, performance alerts."

# Maintenance procedures
kiro-cli "Create TraceLens maintenance procedures. Include: database cleanup, log rotation, performance monitoring, security updates."
```

## Advanced Coordination Techniques

### Multi-Phase Project Management

```bash
# Phase planning
kiro-cli "Plan next development phase for TraceLens based on current progress. Analyze: completed features, remaining requirements, resource allocation, timeline."

# Progress validation
kiro-cli "Validate TraceLens development progress against project requirements. Check: feature completeness, quality metrics, performance targets, security requirements."

# Risk assessment
kiro-cli "Assess risks in TraceLens development. Identify: technical risks, integration challenges, performance bottlenecks, security vulnerabilities."
```

### Cross-Functional Coordination

```bash
# Architecture review
kiro-cli "Review TraceLens architecture for: scalability, maintainability, security, performance. Recommend improvements and refactoring opportunities."

# Technology evaluation
kiro-cli "Evaluate new technologies for TraceLens integration. Consider: AI/ML capabilities, monitoring tools, deployment platforms, development tools."
```

## Command Optimization Tips

### Effective Subagent Communication

**Clear Scope Definition**:
```bash
# Good: Specific scope and deliverables
kiro-cli "Subagent Dashboard: Build real-time performance dashboard with Next.js 14, TypeScript, WebSocket integration, Chart.js visualization, <100ms update latency."

# Avoid: Vague requirements
kiro-cli "Subagent: Build a dashboard"
```

**Context Provision**:
```bash
# Good: Provides necessary context
kiro-cli "Subagent API: Build TraceLens ingestion API using existing PostgreSQL schema (see schema.sql) and TypeScript interfaces (see types.ts). Requirements: Express.js, <100ms response time."

# Avoid: Missing context
kiro-cli "Subagent: Build an API"
```

### Coordination Efficiency

**Batch Related Tasks**:
```bash
# Good: Related tasks in single command
kiro-cli "Subagent Frontend: Build TraceLens dashboard including: component architecture, state management, WebSocket integration, Chart.js visualization, TypeScript types."

# Avoid: Fragmented tasks
kiro-cli "Subagent: Build components"
kiro-cli "Subagent: Add state management"  
kiro-cli "Subagent: Add WebSocket"
```

**Integration Planning**:
```bash
# Good: Plans integration points
kiro-cli "Coordinate TraceLens SDK development. Ensure: consistent APIs between browser and server SDKs, shared TypeScript definitions, compatible event formats, unified documentation."

# Avoid: Assumes coordination will happen
kiro-cli "Build browser SDK"
kiro-cli "Build server SDK"
```

This command reference provides practical templates for systematic development using Kiro CLI's subagent system, based on patterns proven effective during TraceLens development.