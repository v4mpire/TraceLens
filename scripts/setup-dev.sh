#!/bin/bash

# TraceLens Development Environment Setup Script

set -e

echo "🚀 Setting up TraceLens development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build shared packages
echo "🔨 Building shared packages..."
npm run build --workspace=@tracelens/shared
npm run build --workspace=@tracelens/tsconfig
npm run build --workspace=@tracelens/eslint-config

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose ps | grep -q "healthy"; then
        echo "✅ Services are ready!"
        break
    fi
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Services failed to start within 60 seconds"
    docker-compose logs
    exit 1
fi

echo "🎉 Development environment is ready!"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start all services in development mode"
echo "  npm run build        - Build all packages"
echo "  npm test             - Run all tests"
echo "  docker-compose logs  - View service logs"
echo ""
echo "Services:"
echo "  PostgreSQL: localhost:5432 (user: tracelens, db: tracelens)"
echo "  Redis: localhost:6379"
echo "  Web App: http://localhost:3000 (when running)"
echo "  API: http://localhost:3001 (when running)"
