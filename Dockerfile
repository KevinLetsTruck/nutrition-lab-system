FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --legacy-peer-deps

# Copy all files
COPY . .

# Build the application with dummy values
ENV NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-key
ENV SUPABASE_SERVICE_ROLE_KEY=dummy-service-key
ENV ANTHROPIC_API_KEY=dummy-anthropic-key

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set runtime environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
