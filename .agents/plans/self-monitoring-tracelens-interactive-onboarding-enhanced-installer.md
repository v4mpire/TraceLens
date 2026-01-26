# Feature: Self-Monitoring TraceLens with Interactive Onboarding & Enhanced Installer

## Feature Description

Transform TraceLens into a self-observing observability platform where the dashboard monitors its own runtime performance (inspired by Coolify's localhost approach) and guides users through a delightful 2-3 step onboarding flow. Enhance the Python installer with rich progress visualization so developers see exactly what's happening during lengthy build processes.

## User Story

As a developer evaluating TraceLens
I want to immediately see TraceLens monitoring itself with real data
So that I can understand its capabilities before integrating it into my own projects

As a developer installing TraceLens
I want to see detailed progress during the lengthy build process
So that I know the installation is working and how much time remains

## Problem Statement

Currently, after install.py completes, users see a generic dashboard with placeholder metrics. Judges and developers need to immediately experience TraceLens's power by seeing it monitor itself - proving the platform works before they integrate it into other projects. Additionally, the installation process shows minimal output during lengthy operations, leaving developers wondering if it's frozen.

## Solution Statement

Implement a "meta" observability experience where TraceLens monitors its own Next.js dashboard, API routes, and services in real-time. Create an immutable "__SYSTEM__" project that cannot be deleted (like Coolify's localhost monitoring). Add a 3-step interactive onboarding wizard that guides users through the platform. Enhance the Python installer with rich terminal UI showing detailed progress, live package names, and beautiful success screens.

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: High
**Primary Systems Affected**: Web Dashboard, Browser SDK, Database Manager, Python Installer
**Dependencies**: rich (Python), next-themes, react-joyride or shepherd.js

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `apps/web/src/app/dashboard/page.tsx` (lines 1-178) - Why: Current dashboard structure to enhance with self-monitoring
- `apps/web/src/components/dashboard/MetricsGrid.tsx` (lines 1-183) - Why: Metrics display component to show self-monitoring data
- `packages/browser-sdk/src/core/tracer.ts` (lines 1-113) - Why: TraceLensSDK class to instrument dashboard itself
- `packages/ingestion-service/src/database/database-manager.ts` (lines 1-316) - Why: Database operations for __SYSTEM__ project
- `install.py` (lines 1-203) - Why: Current installer to enhance with rich progress bars
- `apps/web/src/hooks/useRealTimeMetrics.ts` (lines 1-87) - Why: Real-time data hook pattern to extend
- `apps/web/src/components/theme-toggle.tsx` (lines 1-55) - Why: Component pattern for onboarding components
- `apps/web/src/app/layout.tsx` (lines 1-29) - Why: Root layout to add onboarding provider

### New Files to Create

- `packages/web/src/bootstrap/self-monitor.ts` - Initialize __SYSTEM__ project and auto-instrumentation
- `packages/browser-sdk/src/self-monitor.ts` - Self-monitoring configuration for dashboard
- `apps/web/src/components/onboarding/OnboardingWizard.tsx` - Main onboarding modal component
- `apps/web/src/components/onboarding/WelcomeStep.tsx` - Step 1: Welcome with health checks
- `apps/web/src/components/onboarding/TourStep.tsx` - Step 2: Interactive dashboard tour
- `apps/web/src/components/onboarding/IntegrationStep.tsx` - Step 3: Framework integration guide
- `apps/web/src/components/SelfMonitoringBanner.tsx` - "Monitoring Itself" badge component
- `apps/web/src/lib/onboarding-state.ts` - Onboarding state management
- `apps/web/src/app/api/self-metrics/route.ts` - API route for __SYSTEM__ project data
- `enhanced-install.py` - Rich terminal UI installer replacement

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Rich Progress Documentation](https://rich.readthedocs.io/en/latest/progress.html)
  - Specific section: Multiple tasks and concurrent progress
  - Why: Required for multi-stage installer progress bars
- [React Joyride Documentation](https://react-joyride.com/)
  - Specific section: Tour steps and callbacks
  - Why: Interactive dashboard tour implementation
- [Next.js App Router](https://nextjs.org/docs/app/building-your-application/routing)
  - Specific section: API Routes and middleware
  - Why: Self-monitoring API endpoints
- [OpenTelemetry Browser](https://opentelemetry.io/docs/instrumentation/js/getting-started/browser/)
  - Specific section: Auto-instrumentation
  - Why: Self-monitoring the dashboard itself

### Patterns to Follow

**Database Project Pattern** (from DatabaseManager):
```typescript
// Create immutable system project
const systemProject = {
  id: '__SYSTEM__',
  name: 'TraceLens Dashboard (Self)',
  deletable: false,
  immutable: true,
  auto_instrument: true
}
```

**Real-time Hook Pattern** (from useRealTimeMetrics):
```typescript
export function useSystemHealth() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    const interval = setInterval(fetchSystemHealth, 5000);
    return () => clearInterval(interval);
  }, []);
}
```

**Component Structure Pattern** (from existing components):
```typescript
'use client';
import { useState, useEffect } from 'react';
// Component with proper TypeScript interfaces and error handling
```

**Rich Progress Pattern**:
```python
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
with Progress() as progress:
    task = progress.add_task("[cyan]Installing...", total=100)
    # Update progress with progress.update(task, advance=10)
```

---

## IMPLEMENTATION PLAN

### Phase 1: Self-Monitoring Foundation

Implement the core self-monitoring system that creates an immutable __SYSTEM__ project and instruments the dashboard to monitor itself.

**Tasks:**
- Create __SYSTEM__ project in database with special flags
- Set up auto-instrumentation for Next.js dashboard
- Configure browser SDK to monitor dashboard performance
- Create API endpoints to serve self-monitoring data

### Phase 2: Enhanced Installer with Rich UI

Replace the basic installer with a rich terminal interface showing detailed progress, live updates, and beautiful success screens.

**Tasks:**
- Install rich library and create enhanced installer
- Implement multi-stage progress tracking
- Add live package installation updates
- Create beautiful success screen with auto-browser launch

### Phase 3: Interactive Onboarding System

Build a 3-step onboarding wizard that appears on first dashboard visit and guides users through TraceLens capabilities.

**Tasks:**
- Create onboarding wizard modal system
- Implement Step 1: Welcome with system health checks
- Implement Step 2: Interactive dashboard tour
- Implement Step 3: Framework-specific integration guide

### Phase 4: Self-Monitoring Dashboard Integration

Integrate self-monitoring data into the dashboard with special badges and real-time updates showing TraceLens monitoring itself.

**Tasks:**
- Add self-monitoring banner to dashboard
- Display live trace counts and system metrics
- Show real performance data from __SYSTEM__ project
- Add "Monitoring Itself" visual indicators

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE packages/web/src/bootstrap/self-monitor.ts

- **IMPLEMENT**: System project initialization and auto-instrumentation setup
- **PATTERN**: Database project creation from DatabaseManager class
- **IMPORTS**: `import { DatabaseManager } from '@tracelens/ingestion-service'`
- **GOTCHA**: Ensure __SYSTEM__ project is created only once and marked immutable
- **VALIDATE**: `curl http://localhost:3001/api/projects | grep __SYSTEM__`

### CREATE packages/browser-sdk/src/self-monitor.ts

- **IMPLEMENT**: Browser SDK configuration for dashboard self-monitoring
- **PATTERN**: TraceLensSDK initialization from tracer.ts
- **IMPORTS**: `import { TraceLensSDK } from './core/tracer'`
- **GOTCHA**: Only enable when TRACELENS_SELF_MONITOR environment variable is true
- **VALIDATE**: `grep -r "TRACELENS_SELF_MONITOR" packages/browser-sdk/`

### UPDATE apps/web/src/app/layout.tsx

- **IMPLEMENT**: Add self-monitoring initialization and onboarding provider
- **PATTERN**: Theme provider pattern from existing layout
- **IMPORTS**: `import { initializeSelfMonitoring } from '@/bootstrap/self-monitor'`
- **GOTCHA**: Initialize self-monitoring before rendering dashboard
- **VALIDATE**: `npm run build && npm run type-check`

### CREATE apps/web/src/components/SelfMonitoringBanner.tsx

- **IMPLEMENT**: Animated badge showing "Monitoring Itself" with live trace count
- **PATTERN**: Badge component structure from existing Badge.tsx
- **IMPORTS**: `import Badge from '@/components/ui/Badge'`
- **GOTCHA**: Use real-time updates with proper cleanup
- **VALIDATE**: Manual test banner appears and updates live trace count

### CREATE enhanced-install.py

- **IMPLEMENT**: Rich terminal UI installer with multi-stage progress bars
- **PATTERN**: Current install.py structure with rich enhancements
- **IMPORTS**: `from rich.progress import Progress, SpinnerColumn, BarColumn`
- **GOTCHA**: Handle npm/pnpm output parsing for live package updates
- **VALIDATE**: `python3 enhanced-install.py --help`

### UPDATE enhanced-install.py (build_packages function)

- **IMPLEMENT**: Granular progress tracking for each package build
- **PATTERN**: Subprocess execution with progress updates
- **IMPORTS**: `import subprocess, time`
- **GOTCHA**: Parse build output to show current package being built
- **VALIDATE**: `python3 enhanced-install.py --dry-run`

### UPDATE enhanced-install.py (display_success_summary function)

- **IMPLEMENT**: Beautiful success screen with service status table
- **PATTERN**: Rich Table and Panel components
- **IMPORTS**: `from rich.table import Table, from rich.panel import Panel`
- **GOTCHA**: Auto-open browser after displaying success screen
- **VALIDATE**: Test success screen displays correctly

### CREATE apps/web/src/components/onboarding/OnboardingWizard.tsx

- **IMPLEMENT**: Main onboarding modal with step navigation
- **PATTERN**: Modal component structure from existing components
- **IMPORTS**: `import { useState, useEffect } from 'react'`
- **GOTCHA**: Modal should be non-dismissible during critical steps
- **VALIDATE**: `npm run build && npm run type-check`

### CREATE apps/web/src/components/onboarding/WelcomeStep.tsx

- **IMPLEMENT**: Welcome step with system health checks and live metrics
- **PATTERN**: Component structure from theme-toggle.tsx
- **IMPORTS**: `import { useSystemHealth } from '@/hooks/useSystemHealth'`
- **GOTCHA**: Show real-time trace counter updates
- **VALIDATE**: Manual test health checks show all services green

### CREATE apps/web/src/components/onboarding/TourStep.tsx

- **IMPLEMENT**: Interactive dashboard tour using react-joyride
- **PATTERN**: Tour step configuration and callbacks
- **IMPORTS**: `import Joyride from 'react-joyride'`
- **GOTCHA**: Tour should highlight elements with live data
- **VALIDATE**: Manual test tour highlights correct dashboard elements

### CREATE apps/web/src/components/onboarding/IntegrationStep.tsx

- **IMPLEMENT**: Framework-specific integration code generator
- **PATTERN**: Code block and copy functionality
- **IMPORTS**: `import { useState } from 'react'`
- **GOTCHA**: Generate different code for Next.js, React, Express
- **VALIDATE**: Manual test code generation for different frameworks

### CREATE apps/web/src/lib/onboarding-state.ts

- **IMPLEMENT**: Onboarding state management with localStorage persistence
- **PATTERN**: Custom hook pattern from useRealTimeMetrics
- **IMPORTS**: `import { useState, useEffect } from 'react'`
- **GOTCHA**: Handle localStorage hydration issues in SSR
- **VALIDATE**: `npm run build && npm run type-check`

### CREATE apps/web/src/app/api/self-metrics/route.ts

- **IMPLEMENT**: API route serving __SYSTEM__ project metrics
- **PATTERN**: API route structure from existing routes
- **IMPORTS**: `import { NextRequest, NextResponse } from 'next/server'`
- **GOTCHA**: Filter for __SYSTEM__ project data only
- **VALIDATE**: `curl http://localhost:3002/api/self-metrics`

### UPDATE apps/web/src/app/dashboard/page.tsx

- **IMPLEMENT**: Add self-monitoring banner and onboarding trigger
- **PATTERN**: Existing dashboard structure with additional components
- **IMPORTS**: `import SelfMonitoringBanner from '@/components/SelfMonitoringBanner'`
- **GOTCHA**: Show onboarding only on first visit
- **VALIDATE**: Manual test dashboard shows self-monitoring banner

### CREATE apps/web/src/hooks/useSystemHealth.ts

- **IMPLEMENT**: System health monitoring hook for onboarding
- **PATTERN**: Real-time hook pattern from useRealTimeMetrics
- **IMPORTS**: `import { useState, useEffect } from 'react'`
- **GOTCHA**: Check all services: web, ingestion, analysis, db, redis
- **VALIDATE**: `npm run build && npm run type-check`

### UPDATE packages/ingestion-service/src/database/database-manager.ts

- **IMPLEMENT**: Add methods for __SYSTEM__ project management
- **PATTERN**: Existing project methods with special handling
- **IMPORTS**: None (extend existing class)
- **GOTCHA**: Prevent deletion of __SYSTEM__ project
- **VALIDATE**: Test __SYSTEM__ project cannot be deleted via API

---

## TESTING STRATEGY

### Unit Tests

**Scope**: Component logic, hooks, and utility functions
**Framework**: Jest with React Testing Library (existing setup)
**Coverage**: 80%+ for new components and hooks

Design unit tests with fixtures and assertions following existing testing approaches in `apps/web/src/lib/__tests__/`

### Integration Tests

**Scope**: API routes, self-monitoring data flow, onboarding workflow
**Framework**: Jest with supertest for API testing
**Coverage**: All API endpoints and critical user workflows

### Visual Tests

**Scope**: Onboarding wizard, self-monitoring banner, installer UI
**Framework**: Playwright for visual regression testing
**Coverage**: All onboarding steps and installer screens

### Edge Cases

- Self-monitoring when backend services are unavailable
- Onboarding state persistence across browser sessions
- Installer progress during network interruptions
- __SYSTEM__ project data integrity

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
npm run lint
npm run type-check
npm run build
python3 -m py_compile enhanced-install.py
```

### Level 2: Unit Tests

```bash
npm run test
npm run test:coverage
```

### Level 3: Integration Tests

```bash
npm run test:integration
curl http://localhost:3002/api/self-metrics
curl http://localhost:3001/api/projects | grep __SYSTEM__
```

### Level 4: Manual Validation

```bash
# Test enhanced installer
python3 enhanced-install.py --dashboard-port 3002 --api-port 3001

# Test self-monitoring
# Open http://localhost:3002 and verify:
# - Self-monitoring banner appears
# - Live trace count updates
# - Onboarding wizard appears on first visit

# Test onboarding flow
# Complete all 3 steps and verify:
# - Health checks show green
# - Tour highlights correct elements
# - Integration code generates correctly
```

### Level 5: Performance Validation

```bash
# Verify self-monitoring overhead
npm run test:performance
# Should maintain <1ms overhead principle
```

---

## ACCEPTANCE CRITERIA

- [ ] __SYSTEM__ project is created automatically and cannot be deleted
- [ ] Dashboard shows "Monitoring Itself" badge with live trace count
- [ ] Self-monitoring data is real (not hardcoded) from dashboard's own performance
- [ ] Enhanced installer shows rich progress bars for all stages
- [ ] Installer displays live package names during installation
- [ ] Beautiful success screen appears with auto-browser launch
- [ ] Onboarding wizard appears automatically on first dashboard visit
- [ ] Step 1 shows system health checks with all services green
- [ ] Step 2 provides interactive tour highlighting key features
- [ ] Step 3 generates framework-specific integration code
- [ ] Onboarding state persists across browser sessions
- [ ] All validation commands pass with zero errors
- [ ] Performance overhead remains <1ms for self-monitoring
- [ ] Visual regression tests pass for all new UI components

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in dependency order
- [ ] Each task validation passed immediately after implementation
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration + visual)
- [ ] No linting or type checking errors
- [ ] Manual testing confirms all features work
- [ ] Acceptance criteria all met
- [ ] Performance budget maintained (<1ms overhead)
- [ ] Self-monitoring data is live and accurate
- [ ] Onboarding provides clear value demonstration
- [ ] Enhanced installer provides excellent developer experience

---

## NOTES

### Design Decisions

**Self-Monitoring Approach**: Using __SYSTEM__ project ensures self-monitoring data is treated like any other project but with special immutable flags, following Coolify's localhost pattern.

**Rich Terminal UI**: Using rich library provides professional installer experience matching modern CLI tools, with real-time progress updates and beautiful success screens.

**Onboarding Strategy**: 3-step wizard balances comprehensive introduction with quick adoption, focusing on immediate value demonstration.

### Performance Considerations

- Self-monitoring uses same <1ms overhead principle as regular monitoring
- Onboarding wizard lazy-loads tour library to minimize bundle impact
- Enhanced installer shows progress to reduce perceived installation time
- Real-time updates use efficient polling intervals (5s for health, 1s for traces)

### Security Considerations

- __SYSTEM__ project data contains no sensitive information
- Self-monitoring only tracks performance metrics, not user data
- Onboarding state stored in localStorage (client-side only)
- Enhanced installer validates all inputs and commands

### Future Enhancements

- WebSocket integration for true real-time self-monitoring updates
- Advanced installer with dependency caching and parallel builds
- Onboarding customization based on detected project framework
- Self-monitoring insights and recommendations for dashboard optimization
