# Production Dockerfile for Security Scanner
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application and shared dependencies
COPY packages/security-scanner/dist ./dist
COPY packages/security-scanner/package.json ./
COPY packages/shared/dist ./node_modules/@tracelens/shared/dist
COPY packages/shared/package.json ./node_modules/@tracelens/shared/package.json

# Install only production dependencies
RUN npm install --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tracelens -u 1001

USER tracelens

EXPOSE 3004

CMD ["node", "dist/index.js"]
