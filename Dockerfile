FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --legacy-peer-deps

# Copy all files
COPY . .

# Build the application
# We set dummy values during build to avoid errors
ENV NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-key
ENV SUPABASE_SERVICE_ROLE_KEY=dummy-service-key
ENV ANTHROPIC_API_KEY=dummy-anthropic-key

RUN npm run build

# Set runtime environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

EXPOSE 8080

# Start with the standalone server
CMD ["node", ".next/standalone/server.js"]
