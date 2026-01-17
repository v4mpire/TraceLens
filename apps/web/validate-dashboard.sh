#!/bin/bash

echo "🚀 TraceLens Dashboard Validation"
echo "=================================="

# Test 1: Build validation
echo "✅ Testing build process..."
cd /mnt/c/Users/ishus/Documents/fadedcaptcha/MyAICoding/TraceLens/dynamous-kiro-hackathon/apps/web
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Build successful"
else
    echo "   ✗ Build failed"
    exit 1
fi

# Test 2: Type checking
echo "✅ Testing TypeScript types..."
npm run type-check > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Type checking passed"
else
    echo "   ✗ Type checking failed"
    exit 1
fi

# Test 3: Check key files exist
echo "✅ Testing file structure..."
files=(
    "src/components/layout/DashboardLayout.tsx"
    "src/components/graphs/DependencyGraph.tsx"
    "src/components/graphs/PerformanceChart.tsx"
    "src/components/graphs/SecurityRiskView.tsx"
    "src/app/dashboard/page.tsx"
    "src/app/traces/page.tsx"
    "src/app/security/page.tsx"
    "src/app/api/traces/route.ts"
    "src/app/api/performance/route.ts"
    "src/app/api/security/route.ts"
    "src/lib/api-client.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file exists"
    else
        echo "   ✗ $file missing"
        exit 1
    fi
done

# Test 4: Check API routes are valid
echo "✅ Testing API route structure..."
if [ -d "src/app/api" ]; then
    echo "   ✓ API routes directory exists"
    api_routes=$(find src/app/api -name "route.ts" | wc -l)
    echo "   ✓ Found $api_routes API routes"
else
    echo "   ✗ API routes directory missing"
    exit 1
fi

echo ""
echo "🎉 All validation tests passed!"
echo "Dashboard is ready for development and testing."
echo ""
echo "Next steps:"
echo "- Run 'npm run dev' to start development server"
echo "- Visit http://localhost:3000 to see the dashboard"
echo "- Navigate to /dashboard, /traces, and /security pages"
