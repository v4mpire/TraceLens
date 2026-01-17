# Production Dockerfile for Ingestion Service
FROM node:18-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application (pre-built locally)
COPY packages/ingestion-service/dist ./dist
COPY packages/ingestion-service/package.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tracelens -u 1001

USER tracelens

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "dist/index.js"]
