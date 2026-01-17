# Production Dockerfile for Analysis Engine
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application (pre-built locally)
COPY ../../packages/analysis-engine/dist ./dist
COPY ../../packages/analysis-engine/package.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tracelens -u 1001

USER tracelens

EXPOSE 3003

CMD ["node", "dist/index.js"]
