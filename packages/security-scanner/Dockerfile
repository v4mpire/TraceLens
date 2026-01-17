# Production Dockerfile for Security Scanner
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application (pre-built locally)
COPY ../../packages/security-scanner/dist ./dist
COPY ../../packages/security-scanner/package.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tracelens -u 1001

USER tracelens

EXPOSE 3004

CMD ["node", "dist/index.js"]
