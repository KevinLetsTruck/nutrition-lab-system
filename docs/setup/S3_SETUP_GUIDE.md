# S3 Integration Setup Guide

## 1. AWS S3 Bucket Setup

### Create S3 Bucket:
1. Login to AWS Console
2. Go to S3 service  
3. Create bucket: `fntp-medical-documents` (or your preferred name)
4. Region: `us-east-1` (or your preferred region)
5. **Important**: Configure bucket for private access (documents contain PHI)

### Create IAM User:
1. Go to IAM in AWS Console
2. Create user: `fntp-document-service`
3. Attach policy: `AmazonS3FullAccess` (or create custom policy)
4. Generate Access Key ID and Secret Access Key

## 2. Local Environment Setup

Your `.env.local` file now includes:
```
S3_REGION=us-east-1
S3_MEDICAL_BUCKET_NAME=fntp-medical-documents  
S3_ACCESS_KEY_ID=your-aws-access-key-here
S3_SECRET_ACCESS_KEY=your-aws-secret-key-here
```

Replace the placeholder values with your actual AWS credentials.

## 3. Railway Production Setup

Add these environment variables in Railway:
1. Go to your Railway project
2. Navigate to Variables tab
3. Add these variables:
   - `S3_REGION` = us-east-1
   - `S3_MEDICAL_BUCKET_NAME` = fntp-medical-documents
   - `S3_ACCESS_KEY_ID` = your-actual-access-key
   - `S3_SECRET_ACCESS_KEY` = your-actual-secret-key

## 4. Test S3 Connection

Run the test script:
```bash
npx ts-node scripts/test-s3-connection.ts
```

## 5. How the Export System Now Works

✅ **LOCAL files**: Downloads from server filesystem (if available)
✅ **S3 files**: Downloads from AWS S3 (with credentials)  
✅ **Missing files**: Provides detailed error information
✅ **Fallback**: Graceful handling with informative placeholders

The export system will now:
1. Try local file system first
2. If not found, attempt S3 download
3. If S3 fails, provide detailed error information
4. Never crash - always provide a complete export
