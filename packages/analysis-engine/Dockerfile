# Production Dockerfile for Analysis Engine
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/analysis-engine/package.json ./packages/analysis-engine/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/analysis-engine ./packages/analysis-engine

# Build the application
RUN npx typescript --build packages/shared
RUN npx typescript --build packages/analysis-engine

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/packages/analysis-engine/dist ./dist
COPY --from=builder /app/packages/analysis-engine/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tracelens -u 1001

USER tracelens

EXPOSE 3003

CMD ["node", "dist/index.js"]
