# Use Node.js 20 Alpine for smaller image
FROM node:20-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps flag
RUN npm ci --legacy-peer-deps

# Copy application files
COPY . .

# Build the Next.js application and prepare standalone output
RUN npm run build && \
    cp -r public .next/standalone/public && \
    cp -r .next/static .next/standalone/.next/static

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the standalone application
COPY --from=builder /app/.next/standalone ./

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
