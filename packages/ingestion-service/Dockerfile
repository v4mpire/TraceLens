# Production Dockerfile for Ingestion Service
FROM node:18-alpine AS base

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages/ingestion-service/package.json ./packages/ingestion-service/
COPY packages/shared/package.json ./packages/shared/
COPY tools/tsconfig/package.json ./tools/tsconfig/
COPY tools/eslint-config/package.json ./tools/eslint-config/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/ingestion-service ./packages/ingestion-service
COPY tools ./tools

# Build the application
RUN npm run build --workspace=@tracelens/shared
RUN npm run build --workspace=@tracelens/ingestion-service

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tracelens -u 1001

# Change ownership
RUN chown -R tracelens:nodejs /app

USER tracelens

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "packages/ingestion-service/dist/index.js"]
