# Environment Setup Guide

## Required Environment Variables

This application requires several environment variables to be configured. Copy `.env.example` to `.env` and update with your actual values.

### Database Configuration
- **DATABASE_URL**: PostgreSQL connection string
  - Default: `postgresql://fntp_admin:fntp_secure_pass_2024@localhost:5432/fntp_nutrition`
  - Update if using a different database setup

### AI Integration
- **ANTHROPIC_API_KEY**: Your Claude API key from Anthropic
  - Get it from: https://console.anthropic.com/
  - Required for AI-powered nutritional analysis

### AWS Services (Document Processing)
- **AWS_ACCESS_KEY_ID**: Your AWS access key
- **AWS_SECRET_ACCESS_KEY**: Your AWS secret key
- **AWS_REGION**: AWS region (default: us-east-1)
- **AWS_S3_BUCKET**: S3 bucket name for document storage
  - Required for document upload and processing features

### Authentication
- **JWT_SECRET**: Secret key for JWT token generation
- **NEXTAUTH_URL**: The URL where your app is hosted
- **NEXTAUTH_SECRET**: Secret for NextAuth.js
  - Generate secure secrets using: `openssl rand -base64 32`

### Application Settings
- **NEXT_PUBLIC_APP_NAME**: Application name (visible to users)
- **NEXT_PUBLIC_APP_URL**: Public URL of your application

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env` files to version control
- Use strong, unique values for all secrets in production
- Rotate secrets regularly
- Use environment-specific values (dev/staging/production)

## Getting API Keys

1. **Anthropic Claude API**:
   - Sign up at https://www.anthropic.com/
   - Navigate to API section in console
   - Create new API key

2. **AWS Credentials**:
   - Sign in to AWS Console
   - Go to IAM → Users → Your User → Security Credentials
   - Create new access key
   - Set up S3 bucket with appropriate permissions

3. **Generate Secure Secrets**:
   ```bash
   # For JWT_SECRET
   openssl rand -base64 32
   
   # For NEXTAUTH_SECRET
   openssl rand -base64 32
   ```
