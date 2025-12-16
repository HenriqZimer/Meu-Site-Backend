# Build stage
FROM node:lts-trixie-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# OTIMIZAÇÃO AQUI:
# Usamos o cache do Docker para guardar os módulos baixados em /root/.npm
# Isso evita baixar a internet inteira se você mudar uma vírgula no código
RUN --mount=type=cache,target=/root/.npm \
  npm ci --prefer-offline --no-audit --progress=false --loglevel=error

# Copy source code
COPY . .

# Set DB URL for build (accepts from docker-compose build args)
ARG MONGODB_URI=
ENV MONGODB_URI=${MONGODB_URI}

# Build application
RUN npm run build

# Production stage
FROM node:lts-trixie-slim

WORKDIR /app

# Copy package files and lock file
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --no-audit && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api', (r) => {process.exit(r.statusCode === 404 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main"]
