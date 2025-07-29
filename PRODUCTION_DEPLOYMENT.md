# Production Deployment Guide

## 🚀 Complete Production Deployment Checklist

This guide will walk you through deploying your Nutrition Lab AI System to production on Vercel with all necessary security, performance, and monitoring configurations.

## 1. PREPARE CODE FOR PRODUCTION

### ✅ Remove Development Code
- [x] Console.log statements removed from production code
- [x] Localhost URLs replaced with dynamic configuration
- [x] Development-only scripts separated
- [x] Error handling enhanced for production

### ✅ Environment Variables Setup
All required environment variables for Vercel:

**Required Variables:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Analysis
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
UPLOAD_DIR=./uploads

# Security & Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
API_KEY_SECRET=your_api_key_secret_here

# Email Notifications (Optional)
RESEND_API_KEY=your_resend_api_key_here
NOTIFICATION_EMAIL=noreply@yourdomain.com

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn_here
```

**Optional Variables:**
```bash
# Performance
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 2. SECURITY ENHANCEMENTS

### ✅ Rate Limiting
- API endpoints protected with rate limiting
- Configurable limits for different endpoints
- IP-based and API key-based limiting

### ✅ Input Validation
- File upload validation enhanced
- API input sanitization
- SQL injection protection

### ✅ CORS Configuration
- Proper CORS settings for production
- Domain-specific allowlist

### ✅ File Upload Security
- File type validation
- Size limits enforced
- Malicious file detection

## 3. PERFORMANCE OPTIMIZATIONS

### ✅ Next.js Configuration
- Optimized build settings
- Image optimization enabled
- Proper caching headers

### ✅ Database Optimization
- Connection pooling configured
- Query optimization
- Index optimization

### ✅ File Processing
- Async processing for large files
- Memory usage optimization
- Timeout handling

## 4. MONITORING & ANALYTICS

### ✅ Error Tracking
- Sentry integration for error monitoring
- Structured error logging
- Performance monitoring

### ✅ Health Checks
- API health check endpoints
- Database connectivity monitoring
- Service status endpoints

### ✅ Analytics
- Basic usage analytics
- Performance metrics
- User behavior tracking

## 5. DEPLOYMENT STEPS

### Step 1: Prepare Your Repository

1. **Push to GitHub:**
```bash
git add .
git commit -m "Production ready: security, performance, and monitoring enhancements"
git push origin main
```

2. **Verify .gitignore:**
Ensure sensitive files are excluded:
```bash
.env*
uploads/
.next/
node_modules/
```

### Step 2: Vercel Configuration

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select Next.js framework

2. **Environment Variables:**
   - Add all required environment variables in Vercel dashboard
   - Use production values (not development ones)

3. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 3: Database Production Setup

1. **Supabase Production:**
   - Ensure your Supabase project is on a paid plan
   - Run production migrations
   - Configure RLS policies for production

2. **Run Migrations:**
```bash
# After deployment, run migrations
npm run db:migrate
```

### Step 4: Domain & SSL

1. **Custom Domain:**
   - Add your custom domain in Vercel
   - Configure DNS records
   - SSL certificate will be auto-provisioned

2. **Update Configuration:**
   - Update `NEXT_PUBLIC_APP_URL` with your domain
   - Update image domains in `next.config.ts`

## 6. POST-DEPLOYMENT VERIFICATION

### ✅ Health Checks
```bash
# Test API endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/analyze

# Test file upload
curl -X POST https://your-domain.com/api/upload \
  -F "file=@test.pdf"
```

### ✅ Database Verification
```bash
# Test database connection
npm run db:query test
```

### ✅ Performance Testing
- Test file upload with large PDFs
- Verify AI analysis response times
- Check memory usage under load

## 7. MONITORING SETUP

### ✅ Sentry Integration
1. Create Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Verify error tracking

### ✅ Analytics Setup
1. Set up Google Analytics
2. Add tracking code
3. Verify data collection

### ✅ Logging
- Application logs in Vercel dashboard
- Database query logs
- Error tracking in Sentry

## 8. MAINTENANCE & UPDATES

### ✅ Regular Tasks
- Monitor error rates in Sentry
- Check database performance
- Review API usage metrics
- Update dependencies regularly

### ✅ Backup Strategy
- Database backups (Supabase handles this)
- File upload backups
- Configuration backups

### ✅ Scaling Considerations
- Monitor resource usage
- Plan for traffic increases
- Consider CDN for file storage

## 9. TROUBLESHOOTING

### Common Issues

**Build Failures:**
- Check environment variables
- Verify Node.js version compatibility
- Check for missing dependencies

**Runtime Errors:**
- Check Sentry for error details
- Verify database connectivity
- Check API key validity

**Performance Issues:**
- Monitor Vercel function execution times
- Check database query performance
- Optimize file processing

## 10. SECURITY CHECKLIST

### ✅ Pre-Deployment
- [ ] All environment variables secured
- [ ] API keys rotated
- [ ] Database RLS policies configured
- [ ] File upload validation tested
- [ ] Rate limiting configured

### ✅ Post-Deployment
- [ ] SSL certificate verified
- [ ] CORS settings tested
- [ ] Error tracking working
- [ ] Monitoring alerts configured
- [ ] Backup strategy verified

## 🎉 Deployment Complete!

Your Nutrition Lab AI System is now ready for production use with:
- ✅ Professional security measures
- ✅ Performance optimizations
- ✅ Comprehensive monitoring
- ✅ Scalable architecture
- ✅ Production-ready error handling

**Next Steps:**
1. Test all functionality in production
2. Set up monitoring alerts
3. Create user documentation
4. Plan for future enhancements

---

**Need Help?**
- Check Vercel deployment logs
- Review Sentry error reports
- Consult the troubleshooting section
- Contact support if needed 