# 🚀 Production Deployment Guide

## Quick Start Deployment

Your Nutrition Lab AI System is now ready for production deployment! Follow these steps to deploy to Vercel.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account
- ✅ Supabase project (paid plan for production)
- ✅ Anthropic API key for Claude AI

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Production ready: security, performance, and monitoring enhancements"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/nutrition-lab-system.git

# Push to GitHub
git push -u origin main
```

### 1.2 Verify .gitignore

Ensure your `.gitignore` file excludes sensitive files:

```bash
# Check what's being ignored
git status --ignored

# Should NOT include:
# - .env*
# - uploads/
# - node_modules/
# - .next/
```

## Step 2: Vercel Setup

### 2.1 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the `nutrition-lab-system` repository
5. Vercel will auto-detect Next.js framework

### 2.2 Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Root Directory**: `./` (leave empty)

### 2.3 Set Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

#### Security & Rate Limiting:
```bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
API_KEY_SECRET=your_api_key_secret_here
```

#### File Upload Configuration:
```bash
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
UPLOAD_DIR=./uploads
```

#### Optional Variables:
```bash
# Email notifications
RESEND_API_KEY=your_resend_api_key_here
NOTIFICATION_EMAIL=noreply@yourdomain.com

# Monitoring
SENTRY_DSN=your_sentry_dsn_here

# Performance
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2.4 Deploy

Click "Deploy" and wait for the build to complete.

## Step 3: Database Setup

### 3.1 Run Migrations

After deployment, run database migrations:

```bash
# Option 1: Use Vercel CLI
vercel env pull .env.local
npm run db:migrate

# Option 2: Use Supabase Dashboard
# Go to your Supabase project > SQL Editor
# Run the migration files from database/migrations/
```

### 3.2 Verify Database Connection

Test the database connection:

```bash
npm run db:query test
```

## Step 4: Post-Deployment Verification

### 4.1 Health Check

Test the health endpoint:

```bash
curl https://your-vercel-url.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "healthy",
    "latency": 123
  }
}
```

### 4.2 Test API Endpoints

Test the main functionality:

```bash
# Test analyze endpoint
curl https://your-vercel-url.vercel.app/api/analyze

# Test upload endpoint
curl -X POST https://your-vercel-url.vercel.app/api/upload \
  -F "file=@test.pdf"
```

### 4.3 Test File Upload

1. Go to your deployed application
2. Try uploading a test PDF
3. Verify the analysis works
4. Check that results are saved to database

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be auto-provisioned

### 5.2 Update Configuration

After adding custom domain, update:

1. `NEXT_PUBLIC_APP_URL` environment variable
2. Image domains in `next.config.ts`
3. CORS settings if needed

## Step 6: Monitoring Setup

### 6.1 Sentry Integration (Recommended)

1. Create account at [sentry.io](https://sentry.io)
2. Create new project for Next.js
3. Add `SENTRY_DSN` to environment variables
4. Verify error tracking works

### 6.2 Google Analytics (Optional)

1. Create Google Analytics account
2. Add `NEXT_PUBLIC_GA_ID` to environment variables
3. Verify tracking works

## Step 7: Security Verification

### 7.1 SSL Certificate

Verify SSL is working:
```bash
curl -I https://your-domain.com
# Should show HTTPS and valid certificate
```

### 7.2 Rate Limiting

Test rate limiting:
```bash
# Make multiple rapid requests
for i in {1..110}; do
  curl https://your-domain.com/api/analyze
done
# Should get 429 after 100 requests
```

### 7.3 File Upload Security

Test file validation:
```bash
# Try uploading invalid file
curl -X POST https://your-domain.com/api/upload \
  -F "file=@invalid.exe"
# Should be rejected
```

## Troubleshooting

### Build Failures

**Error**: "Module not found"
- Check all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error**: "Environment variable not found"
- Verify all required variables are set in Vercel
- Check variable names match exactly

### Runtime Errors

**Error**: "Database connection failed"
- Verify Supabase credentials
- Check Supabase project is active
- Ensure service role key has proper permissions

**Error**: "AI analysis failed"
- Verify Anthropic API key is valid
- Check API key has sufficient credits
- Verify Claude model access

### Performance Issues

**Slow response times**:
- Check Vercel function execution times
- Optimize database queries
- Consider upgrading Vercel plan

**Memory issues**:
- Monitor function memory usage
- Optimize file processing
- Consider using external storage for large files

## Maintenance

### Regular Tasks

1. **Monitor Error Rates**: Check Sentry dashboard weekly
2. **Database Performance**: Monitor query performance
3. **API Usage**: Track Anthropic API usage and costs
4. **Security Updates**: Keep dependencies updated
5. **Backup Verification**: Ensure backups are working

### Updates

1. **Dependencies**: Update regularly with `npm update`
2. **Security Patches**: Apply security updates promptly
3. **Feature Updates**: Deploy new features through GitHub

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Sentry error reports
3. Test locally with production environment variables
4. Check Supabase dashboard for database issues
5. Verify all environment variables are set correctly

## 🎉 Congratulations!

Your Nutrition Lab AI System is now live in production with:
- ✅ Professional security measures
- ✅ Performance optimizations
- ✅ Comprehensive monitoring
- ✅ Scalable architecture
- ✅ Production-ready error handling

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring alerts
3. Create user documentation
4. Plan for future enhancements
5. Consider setting up staging environment

---

**Need Help?**
- Check the troubleshooting section above
- Review Vercel documentation
- Consult Supabase documentation
- Contact support if needed 