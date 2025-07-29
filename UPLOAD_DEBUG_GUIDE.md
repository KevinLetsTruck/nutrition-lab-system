# Upload System Debug Guide

## Issues Fixed

### 1. Serverless Environment Compatibility
**Problem**: File system operations don't work in Vercel's serverless environment
**Solution**: 
- Updated `file-utils.ts` to use temporary directory (`tmpdir()`) instead of local file system
- Added proper error handling for file operations
- Improved file validation with better error messages

### 2. Multiple File Upload Support
**Problem**: API only handled single files, but frontend expected multiple file support
**Solution**:
- Updated `/api/upload/route.ts` to handle multiple files using `formData.getAll('file')`
- Added batch processing with individual error handling per file
- Improved response format to include success/failure counts

### 3. Environment Variable Issues
**Problem**: Missing or incorrect environment variables in production
**Solution**:
- Added validation for required client information
- Improved error messages for missing environment variables
- Added GET endpoint to check configuration

### 4. File Size and Type Validation
**Problem**: Poor error messages and validation issues
**Solution**:
- Enhanced file validation with detailed error messages
- Added file size display in MB instead of bytes
- Better file type checking

### 5. CORS and Network Issues
**Problem**: CORS headers not properly configured
**Solution**:
- Updated `vercel.json` with proper CORS headers
- Added `X-Requested-With` to allowed headers
- Increased function timeout to 60 seconds

## Testing Steps

### 1. Local Testing
```bash
# Start the development server
npm run dev

# Test the upload API
node scripts/test-upload.js
```

### 2. Environment Variable Check
Verify these variables are set in Vercel:
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MAX_FILE_SIZE` (default: 10485760 = 10MB)
- `ALLOWED_FILE_TYPES` (default: pdf,jpg,jpeg,png)

### 3. API Endpoint Testing
```bash
# Test upload endpoint
curl -X GET http://localhost:3000/api/upload

# Test with a file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.pdf" \
  -F "clientEmail=test@example.com" \
  -F "clientFirstName=Test" \
  -F "clientLastName=User"
```

## Common Issues and Solutions

### Issue: 400 Bad Request
**Causes**:
- Missing client information
- Invalid file type
- File too large
- No files provided

**Debug Steps**:
1. Check browser console for detailed error messages
2. Verify all required fields are filled
3. Check file size and type
4. Test with single file first

### Issue: 500 Internal Server Error
**Causes**:
- Missing environment variables
- File system access issues
- Database connection problems

**Debug Steps**:
1. Check Vercel function logs
2. Verify environment variables are set
3. Test database connection
4. Check file permissions

### Issue: CORS Errors
**Causes**:
- Missing CORS headers
- Incorrect origin configuration

**Debug Steps**:
1. Check browser network tab
2. Verify `vercel.json` CORS configuration
3. Test with different browsers

### Issue: Timeout Errors
**Causes**:
- Large files taking too long
- Function timeout too short

**Debug Steps**:
1. Check file sizes
2. Increase function timeout in `vercel.json`
3. Optimize file processing

## Production Deployment Checklist

### Before Deployment
- [ ] All environment variables set in Vercel
- [ ] Database connection tested
- [ ] File upload limits configured
- [ ] CORS settings verified
- [ ] Function timeouts set appropriately

### After Deployment
- [ ] Test single file upload
- [ ] Test multiple file upload
- [ ] Test different file types
- [ ] Test large files
- [ ] Check error handling
- [ ] Verify analysis pipeline

## Monitoring and Logging

### Key Metrics to Monitor
- Upload success rate
- File processing time
- Error rates by type
- Function execution time
- Memory usage

### Logging Improvements
- Added detailed file processing logs
- Error context information
- Performance metrics
- Client information tracking

## Troubleshooting Commands

### Check Vercel Logs
```bash
vercel logs --follow
```

### Test Environment Variables
```bash
vercel env ls
```

### Deploy with Debug Info
```bash
vercel --debug
```

### Check Function Status
```bash
vercel functions ls
```

## Performance Optimization

### File Processing
- Use streaming for large files
- Implement chunked uploads
- Add progress indicators
- Optimize file validation

### Database Operations
- Use connection pooling
- Implement caching
- Batch database operations
- Add retry logic

### Error Handling
- Graceful degradation
- User-friendly error messages
- Automatic retry for transient errors
- Detailed logging for debugging

## Security Considerations

### File Upload Security
- Validate file types server-side
- Scan for malware
- Limit file sizes
- Sanitize filenames

### API Security
- Rate limiting
- Input validation
- CORS configuration
- Authentication/authorization

### Data Protection
- Encrypt sensitive data
- Secure file storage
- Access control
- Audit logging 