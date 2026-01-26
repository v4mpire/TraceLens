# TraceLens Development Logging System

## Overview

TraceLens uses a systematic development ledger to track all development activities, ensuring complete traceability and enabling data-driven development insights. Every bug fix, feature addition, UI change, and development decision is recorded in `DEVLOG.md` using a standardized format.

## Quick Start

### Using the Shell Script (Recommended)
```bash
# Log a new feature
./scripts/log.sh feature "Dashboard UI" "Added theme toggle" high "apps/web/src/" "30 minutes"

# Log a bug fix with additional context
./scripts/log.sh bug "API Client" "Fixed timeout issue" critical "packages/shared/" "1 hour" --context "Root cause: missing error handling"

# Log a UI change
./scripts/log.sh ui "Navigation" "Updated breadcrumbs" medium "apps/web/src/components/" "45 minutes"
```

### Using the Python Script Directly
```bash
python3 scripts/log-dev-activity.py \
  --type FEATURE \
  --component "Dashboard UI" \
  --description "Added theme toggle" \
  --impact HIGH \
  --files "apps/web/src/" \
  --duration "30 minutes"
```

## Entry Types

| Type | Description | When to Use |
|------|-------------|-------------|
| `FEATURE` | New functionality added | Adding new capabilities, components, or services |
| `BUG_FIX` | Fixing defects or issues | Resolving bugs, errors, or unexpected behavior |
| `UI_CHANGE` | User interface modifications | Visual changes, layout updates, styling improvements |
| `PERFORMANCE` | Performance optimizations | Speed improvements, memory optimizations, efficiency gains |
| `DOCUMENTATION` | Documentation updates | README changes, API docs, guides, comments |
| `REFACTOR` | Code restructuring | Code cleanup, architecture changes, technical debt |

## Impact Levels

| Level | Description | Examples |
|-------|-------------|----------|
| `CRITICAL` | Core functionality, breaking changes | SDK changes, API modifications, security fixes |
| `HIGH` | Significant features or fixes | New major components, important bug fixes |
| `MEDIUM` | Standard improvements | UI enhancements, minor features, optimizations |
| `LOW` | Small changes, maintenance | Documentation updates, code cleanup, minor fixes |

## Logging Protocol

### When to Log
- **Before starting work**: Log planned activities for complex changes
- **After completing work**: Always log completed activities
- **For bug fixes**: Include root cause analysis when known
- **For features**: Include performance impact and testing status
- **For UI changes**: Include user experience impact
- **For documentation**: Include scope and target audience

### Required Information
1. **Type**: Category of development activity
2. **Component**: Specific system component affected
3. **Description**: Clear, concise description of what was changed
4. **Impact**: Assessment of change significance
5. **Files**: List of modified files/directories
6. **Duration**: Time spent on the activity

### Optional Information
- **Impact Description**: Brief explanation of why the impact level was chosen
- **Developer**: Name of the developer (defaults to "AI Assistant")
- **Additional Context**: Performance notes, testing status, dependencies, root causes

## Ledger Structure

The `DEVLOG.md` file follows this structure:

```markdown
# TraceLens Development Ledger

## Ledger Summary
[Statistics table with counts by type]

## Development Entries
[Chronological list of all activities]

## Ledger Statistics
[Analysis of development patterns]

## Development Methodology
[Documentation of the logging approach]
```

## Automation Features

### Automatic Entry Numbering
The system automatically assigns sequential entry numbers, ensuring no gaps or duplicates.

### Summary Statistics Updates
Each new entry automatically updates the ledger summary statistics, including:
- Total entries count
- Counts by entry type
- Development velocity metrics

### Timestamp Generation
All entries receive UTC timestamps for consistent time tracking across time zones.

## Best Practices

### Writing Descriptions
- Use active voice: "Added theme toggle" not "Theme toggle was added"
- Be specific: "Fixed timeout in API client" not "Fixed bug"
- Include context: "Updated breadcrumbs for better navigation" not "Updated breadcrumbs"

### Choosing Impact Levels
- Consider user impact, not just code complexity
- Breaking changes are always CRITICAL
- New user-facing features are typically HIGH
- Internal improvements are usually MEDIUM or LOW

### File Paths
- Use relative paths from project root
- Include directories for broad changes: "apps/web/src/"
- Include specific files for targeted changes: "packages/shared/types.ts"

### Duration Estimates
- Be realistic about time spent
- Include research and testing time
- Use consistent units: "30 minutes", "2 hours", "1 day"

## Integration with @prime Command

The `@prime` command has been updated to initialize the development logging system:

1. **Reads current ledger**: Understands existing entries and statistics
2. **Prepares next entry number**: Calculates the next sequential number
3. **Establishes logging protocol**: Sets up systematic tracking for all future work
4. **Validates ledger format**: Ensures the DEVLOG.md structure is correct

## Reporting and Analysis

The ledger enables various analyses:

### Development Velocity
- Entries per day/week
- Time spent by component
- Most active development periods

### Quality Metrics
- Bug fix rate (bugs / total entries)
- Component stability (bugs per component)
- Impact distribution

### Component Activity
- Most frequently modified components
- Components with highest bug rates
- Development effort distribution

## Troubleshooting

### Common Issues

**"DEVLOG.md not found"**
- Ensure you're in the project root directory
- Check that DEVLOG.md exists and is readable

**"Could not find insertion point"**
- Verify DEVLOG.md has the correct structure
- Look for "## Development Entries" section

**"Permission denied"**
- Ensure scripts have execute permissions: `chmod +x scripts/log.sh`
- Check file write permissions for DEVLOG.md

### Manual Logging

If the automated tools fail, you can manually add entries to DEVLOG.md following this template:

```markdown
### Entry #XXX - YYYY-MM-DD HH:MM UTC
**Type**: [TYPE]  
**Component**: [Component Name]  
**Description**: [Description]  
**Impact**: [LEVEL] - [Impact explanation]  
**Files Changed**: [Files/directories]  
**Developer**: [Developer name]  
**Duration**: [Time spent]  
[Additional context if needed]
```

## Future Enhancements

Planned improvements to the logging system:

1. **Git Integration**: Automatic logging from commit messages
2. **IDE Plugins**: Direct logging from development environments
3. **Analytics Dashboard**: Visual reporting of development metrics
4. **Automated Testing**: Validation of ledger format and completeness
5. **Export Formats**: JSON/CSV export for external analysis

---

**Remember**: Systematic logging is crucial for understanding development patterns, identifying bottlenecks, and maintaining project quality. Every development activity should be logged for complete traceability.