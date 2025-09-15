# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    openssl \
    libssl3 \
    wget \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Copy package files first for better caching
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY backend/ .

# Copy and make startup script executable
COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create logs directory
RUN mkdir -p logs && chown -R nextjs:nodejs logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check disabled temporarily for debugging
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]