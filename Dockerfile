FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema for postinstall generation
COPY prisma ./prisma

# Install all dependencies (will run postinstall -> prisma generate)
RUN npm ci --legacy-peer-deps

# Copy all files
COPY . .

# Build the application
# Use dummy DATABASE_URL for Prisma generation during build
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy?sslmode=require"

# Set build-time arguments for Next.js public env vars
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Generate Prisma client and build Next.js
RUN npx prisma generate && npm run build

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
