# Environment Configuration for Medical Document Processing

## Required Environment Variables

Copy these variables to your `.env` file and replace the placeholder values with your actual configuration:

```bash
# Database - Railway PostgreSQL
DATABASE_URL="postgresql://fntp_admin:fntp_secure_pass_2024@localhost:5432/fntp_nutrition"
# Railway Database URL (replace with actual Railway connection string)
# DATABASE_URL="postgresql://postgres:password@railway-host:5432/railway"

# Claude AI (Anthropic)
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="fntp-documents"
AWS_S3_REGION="us-east-1"

# Cloudinary Configuration (Alternative to S3)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Redis Configuration (for BullMQ)
REDIS_URL="redis://localhost:6379"
# Railway Redis URL (replace with actual Railway Redis connection string)
# REDIS_URL="redis://:password@railway-redis-host:6379"

# Document Processing Configuration
DOCUMENT_STORAGE_PROVIDER="S3" # Options: S3, CLOUDINARY, LOCAL
MAX_FILE_SIZE="50000000" # 50MB in bytes
ALLOWED_FILE_TYPES="pdf,jpg,jpeg,png,tiff,doc,docx,txt"
PROCESSING_CONCURRENCY="5"
OCR_PROVIDER="CLAUDE" # Options: CLAUDE, GOOGLE_VISION, TESSERACT

# Queue Configuration
QUEUE_REDIS_URL="${REDIS_URL}"
QUEUE_DEFAULT_CONCURRENCY="3"
QUEUE_MAX_ATTEMPTS="3"
QUEUE_BACKOFF_DELAY="5000"

# WebSocket Configuration
SOCKET_IO_PORT="3001"
SOCKET_IO_CORS_ORIGIN="http://localhost:3000,https://your-production-domain.com"

# Auth
JWT_SECRET="your-super-secure-jwt-secret-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"

# App Config
NEXT_PUBLIC_APP_NAME="FNTP Nutrition System"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Medical Document Processing
MEDICAL_DOC_ENCRYPTION_KEY="your-hipaa-compliant-encryption-key-32-chars"
PHI_DETECTION_ENABLED="true"
AUDIT_LOG_RETENTION_DAYS="2555" # 7 years for HIPAA compliance

# OCR Services
GOOGLE_VISION_API_KEY="your-google-vision-api-key"
TESSERACT_LANG="eng"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000" # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_SKIP_FAILED_REQUESTS="true"

# Monitoring and Logging
LOG_LEVEL="info"
ENABLE_REQUEST_LOGGING="true"
SENTRY_DSN="your-sentry-dsn-for-error-tracking"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@fntp-nutrition.com"
```

## Setup Instructions

### 1. Railway PostgreSQL Setup

1. Create a Railway project at https://railway.app
2. Add a PostgreSQL service to your project
3. Copy the DATABASE_URL from Railway and replace the local one
4. Run `npx prisma db push` to sync your schema

### 2. AWS S3 Setup

1. Create an AWS account and S3 bucket
2. Create IAM user with S3 permissions
3. Generate access keys and add to environment variables
4. Configure bucket CORS for file uploads

### 3. Cloudinary Setup (Alternative to S3)

1. Create account at https://cloudinary.com
2. Get your cloud name, API key, and secret from dashboard
3. Set `DOCUMENT_STORAGE_PROVIDER="CLOUDINARY"` to use Cloudinary

### 4. Redis Setup for Queues

1. Add Redis service to your Railway project, OR
2. Use Railway's Redis add-on, OR
3. Use external Redis provider like Upstash
4. Update REDIS_URL with your connection string

### 5. Security Configuration

1. Generate a secure 32-character encryption key for `MEDICAL_DOC_ENCRYPTION_KEY`
2. Update JWT secrets with secure random strings
3. Enable PHI detection for HIPAA compliance
4. Configure appropriate CORS origins for production

## Production Configuration

For production deployment:

1. Update all placeholder values with real credentials
2. Set `NODE_ENV="production"`
3. Configure proper CORS origins
4. Set up monitoring with Sentry
5. Configure email service for notifications
6. Enable audit log retention for HIPAA compliance

## Environment Variables Validation

The system will validate required environment variables on startup and provide clear error messages for missing or invalid configuration.
