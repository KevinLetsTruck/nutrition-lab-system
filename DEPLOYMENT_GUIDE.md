# Medical Document Processing System - Deployment Guide

This guide covers deploying the robust medical document processing system with PostgreSQL on Railway, S3/Cloudinary storage, Redis queues, and real-time WebSocket support.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Railway Deployment](#railway-deployment)
4. [Storage Configuration](#storage-configuration)
5. [Queue System Setup](#queue-system-setup)
6. [WebSocket Configuration](#websocket-configuration)
7. [Database Migration](#database-migration)
8. [Production Deployment](#production-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment

- Node.js 18+ 
- npm or yarn
- Git
- Docker (for local Redis)

### Production Services

- [Railway](https://railway.app) account
- [AWS S3](https://aws.amazon.com/s3/) or [Cloudinary](https://cloudinary.com) account
- [Anthropic Claude API](https://www.anthropic.com) key
- Domain name (optional, for custom domains)

## Environment Setup

### 1. Install Dependencies

```bash
npm install @prisma/client prisma @aws-sdk/client-s3 @aws-sdk/s3-request-presigner 
npm install ioredis bullmq sharp multer multer-s3 cloudinary
npm install socket.io socket.io-client
npm install -D @types/multer
```

### 2. Configure Environment Variables

Copy the environment configuration from `ENV_CONFIG.md` to your `.env` file:

```bash
# Copy example configuration
cp ENV_CONFIG.md .env.local

# Edit with your actual values
nano .env.local
```

### 3. Essential Environment Variables

```bash
# Database - Railway PostgreSQL
DATABASE_URL="postgresql://postgres:password@railway-host:5432/railway"

# Claude AI (Anthropic)
ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"

# Storage (choose one)
# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="fntp-documents"
DOCUMENT_STORAGE_PROVIDER="S3"

# OR Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
DOCUMENT_STORAGE_PROVIDER="CLOUDINARY"

# Redis for Queues
REDIS_URL="redis://:password@railway-redis-host:6379"

# Security
JWT_SECRET="your-super-secure-jwt-secret-change-this-in-production"
MEDICAL_DOC_ENCRYPTION_KEY="your-hipaa-compliant-encryption-key-32-chars"

# App Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Railway Deployment

### 1. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

### 2. Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Choose "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL instance
4. Copy the connection string from the "Variables" tab

### 3. Add Redis Service

1. Click "New Service" → "Database" → "Redis"
2. Copy the Redis URL from the "Variables" tab

### 4. Configure Environment Variables

In your Railway project settings, add all environment variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@railway-host:5432/railway

# Redis
REDIS_URL=redis://:password@railway-redis-host:6379

# Storage (AWS S3 example)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=fntp-documents
DOCUMENT_STORAGE_PROVIDER=S3

# AI
ANTHROPIC_API_KEY=sk-ant-api03-your-key

# Security
JWT_SECRET=your-jwt-secret
MEDICAL_DOC_ENCRYPTION_KEY=your-32-char-encryption-key

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-railway-domain.up.railway.app
```

### 5. Deploy

Railway will automatically deploy when you push to your main branch.

## Storage Configuration

### AWS S3 Setup

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://fntp-documents --region us-east-1
   ```

2. **Configure CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-domain.com"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. **Create IAM User**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::fntp-documents",
           "arn:aws:s3:::fntp-documents/*"
         ]
       }
     ]
   }
   ```

### Cloudinary Setup (Alternative)

1. **Create Account** at [Cloudinary.com](https://cloudinary.com)
2. **Get Credentials** from your dashboard
3. **Configure Upload Preset**:
   - Go to Settings → Upload
   - Create new upload preset
   - Set mode to "Authenticated"
   - Enable folder organization

## Queue System Setup

### Local Development (Docker)

```bash
# Start Redis container
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest

# Or use docker-compose
cat > docker-compose.redis.yml << EOF
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
volumes:
  redis_data:
EOF

docker-compose -f docker-compose.redis.yml up -d
```

### Production (Railway Redis)

Redis is automatically configured when you add the Redis service to your Railway project.

### Queue Workers

The system includes background workers that automatically process jobs. To start workers in production:

```javascript
// In your main application startup
import { workerManager } from '@/lib/queue/workers';

// Start workers when application starts
await workerManager.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await workerManager.stop();
});
```

## WebSocket Configuration

### Production Socket.IO Setup

1. **Configure CORS Origins**
   ```bash
   SOCKET_IO_CORS_ORIGIN="https://your-domain.com,https://your-railway-domain.up.railway.app"
   ```

2. **Add Socket.IO to Next.js**

   Create `pages/api/socket.ts`:
   ```typescript
   import { Server } from 'socket.io';
   import { socketServer } from '@/lib/websocket/server';

   export default function handler(req: any, res: any) {
     if (!res.socket.server.io) {
       console.log('Initializing Socket.IO server...');
       const io = new Server(res.socket.server);
       res.socket.server.io = io;
       
       // Initialize our socket server
       socketServer.initialize(io);
     }
     res.end();
   }
   ```

3. **Client Configuration**
   ```typescript
   const socket = io(process.env.NODE_ENV === 'production' 
     ? 'https://your-domain.com' 
     : 'http://localhost:3000'
   );
   ```

## Database Migration

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Apply Database Schema

```bash
# For new database
npx prisma db push

# Or use migrations
npx prisma migrate deploy
```

### 3. Seed Database (Optional)

```bash
# Create seed script
cat > prisma/seed.ts << EOF
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@fntp.com' },
    update: {},
    create: {
      email: 'admin@fntp.com',
      name: 'System Admin',
      password: 'hashed_password_here',
      role: 'admin',
    },
  });

  console.log('Seeded user:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
EOF

# Run seed
npx prisma db seed
```

## Production Deployment

### 1. Build Optimization

```bash
# Optimize for production
npm run build

# Test build locally
npm start
```

### 2. Health Checks

Create `pages/api/health.ts`:
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { storageService } from '@/lib/storage';
import { queueManager } from '@/lib/queue/manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Database health
    await prisma.$queryRaw`SELECT 1`;
    
    // Storage health
    const storageHealth = await storageService.healthCheck();
    
    // Queue health
    const queueHealth = await queueManager.getAllQueuesHealth();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        storage: storageHealth.status,
        queues: queueHealth.every(q => q.status === 'healthy') ? 'healthy' : 'degraded'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### 3. Railway Production Settings

```bash
# Build command
npm run build

# Start command  
npm start

# Environment
NODE_ENV=production
```

## Monitoring & Maintenance

### 1. Application Monitoring

```bash
# Add to package.json
npm install @sentry/nextjs

# Configure Sentry
SENTRY_DSN=your-sentry-dsn
```

### 2. Database Monitoring

```sql
-- Monitor database performance
SELECT schemaname, tablename, 
       n_tup_ins as inserts,
       n_tup_upd as updates, 
       n_tup_del as deletes
FROM pg_stat_user_tables 
ORDER BY n_tup_ins DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

### 3. Queue Monitoring

```typescript
// Monitor queue health
const queueHealth = await queueManager.getAllQueuesHealth();

// Alert on unhealthy queues
queueHealth.forEach(queue => {
  if (queue.status === 'critical') {
    // Send alert
    console.error(`Queue ${queue.queueName} is critical!`);
  }
});
```

### 4. Storage Monitoring

```typescript
// Monitor storage usage
const storageStats = await storageService.getStorageUsage();
console.log('Storage usage:', storageStats);
```

### 5. Log Management

```bash
# Railway logs
railway logs

# Application logs
tail -f /var/log/app.log
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Check connection string
echo $DATABASE_URL
```

#### 2. Storage Upload Failures

```typescript
// Test storage connectivity
const health = await storageService.healthCheck();
console.log('Storage health:', health);
```

#### 3. Queue Not Processing

```bash
# Check Redis connection
redis-cli -u $REDIS_URL ping

# Monitor queue status
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.com/api/documents/process
```

#### 4. WebSocket Connection Issues

```javascript
// Test WebSocket connection
const socket = io('https://your-app.com');
socket.on('connect', () => console.log('Connected'));
socket.on('connect_error', (error) => console.error('Connection error:', error));
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX CONCURRENTLY idx_documents_client_status 
ON documents(client_id, status);

CREATE INDEX CONCURRENTLY idx_lab_values_client_test 
ON lab_values(client_id, test_name);

-- Vacuum and analyze
VACUUM ANALYZE;
```

#### 2. Storage Optimization

```typescript
// Enable compression for large files
const uploadOptions = {
  compress: true,
  quality: 80,
  format: 'webp' // for images
};
```

#### 3. Queue Optimization

```typescript
// Adjust concurrency based on load
const workerOptions = {
  concurrency: process.env.NODE_ENV === 'production' ? 10 : 3
};
```

### Security Considerations

#### 1. HIPAA Compliance

- Enable encryption at rest and in transit
- Implement proper access controls
- Maintain audit logs for 7 years
- Regular security assessments

#### 2. API Security

```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

#### 3. Data Protection

```typescript
// Encrypt sensitive data
import crypto from 'crypto';

const encryptPHI = (data: string, key: string) => {
  const cipher = crypto.createCipher('aes-256-gcm', key);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**: Use Railway's load balancer or CloudFlare
2. **Database Scaling**: Consider read replicas for heavy read workloads
3. **Storage Scaling**: S3/Cloudinary automatically scale
4. **Queue Scaling**: Add more Redis instances or use Redis Cluster

### Vertical Scaling

1. **Railway Scaling**: Upgrade your Railway plan for more resources
2. **Worker Scaling**: Increase worker concurrency based on CPU/memory
3. **Database Scaling**: Upgrade PostgreSQL plan on Railway

This deployment guide provides a comprehensive approach to deploying the medical document processing system in production with all necessary services and monitoring.
