#!/bin/bash
# TraceLens Development Activity Logger - Shell Wrapper
# 
# Usage examples:
#   ./scripts/log.sh feature "Dashboard UI" "Added theme toggle" high "apps/web/src/" "30 minutes"
#   ./scripts/log.sh bug "API Client" "Fixed timeout issue" critical "packages/shared/" "1 hour" --context "Root cause: missing error handling"
#   ./scripts/log.sh ui "Navigation" "Updated breadcrumbs" medium "apps/web/src/components/" "45 minutes"

set -e

# Check if we have the required arguments
if [ $# -lt 6 ]; then
    echo "Usage: $0 <type> <component> <description> <impact> <files> <duration> [--context <additional_context>]"
    echo ""
    echo "Types: feature, bug, ui, performance, docs, refactor"
    echo "Impact: critical, high, medium, low"
    echo ""
    echo "Examples:"
    echo "  $0 feature \"Dashboard UI\" \"Added theme toggle\" high \"apps/web/src/\" \"30 minutes\""
    echo "  $0 bug \"API Client\" \"Fixed timeout\" critical \"packages/shared/\" \"1 hour\" --context \"Root cause: missing error handling\""
    exit 1
fi

# Map short names to full types
case "$1" in
    "feature") TYPE="FEATURE" ;;
    "bug") TYPE="BUG_FIX" ;;
    "ui") TYPE="UI_CHANGE" ;;
    "performance") TYPE="PERFORMANCE" ;;
    "docs") TYPE="DOCUMENTATION" ;;
    "refactor") TYPE="REFACTOR" ;;
    *) echo "Error: Invalid type '$1'. Use: feature, bug, ui, performance, docs, refactor"; exit 1 ;;
esac

# Map impact levels
case "$4" in
    "critical") IMPACT="CRITICAL" ;;
    "high") IMPACT="HIGH" ;;
    "medium") IMPACT="MEDIUM" ;;
    "low") IMPACT="LOW" ;;
    *) echo "Error: Invalid impact '$4'. Use: critical, high, medium, low"; exit 1 ;;
esac

COMPONENT="$2"
DESCRIPTION="$3"
FILES="$5"
DURATION="$6"

# Build the command
CMD="python3 scripts/log-dev-activity.py --type $TYPE --component \"$COMPONENT\" --description \"$DESCRIPTION\" --impact $IMPACT --files \"$FILES\" --duration \"$DURATION\""

# Add additional context if provided
if [ "$7" = "--context" ] && [ -n "$8" ]; then
    CMD="$CMD --additional-context \"$8\""
fi

# Execute the logging command
echo "Logging development activity..."
eval $CMD

echo ""
echo "✅ Development activity logged successfully!"
echo "📝 Entry added to DEVLOG.md with systematic tracking"