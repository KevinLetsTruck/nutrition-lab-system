# Lab Analysis System Deployment Checklist

## Pre-Deployment Steps ✅

### 1. Code Status
- [x] All changes committed to main branch
- [x] Tagged as v3.0.0-lab-analysis
- [x] All dependencies added to package.json
- [x] Build passes locally

### 2. Environment Variables Required
Ensure these are set in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
ANTHROPIC_API_KEY=your_anthropic_key
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_BASE_URL=https://nutrition-lab-system-lets-truck.vercel.app
```

## Database Migration Steps 🗄️

### 1. Create Storage Bucket
In Supabase Dashboard:
1. Go to Storage
2. Create new bucket: `lab-documents`
3. Set to Public (for file URLs)
4. Add policies for authenticated users

### 2. Run Database Migrations
Execute in Supabase SQL Editor in this order:

```sql
-- 1. First run the lab analysis schema
-- Copy contents of database/migrations/019_lab_analysis_system.sql

-- 2. Then seed the lab test catalog
-- Copy contents of database/seeds/lab_test_catalog_seed.sql
```

### 3. Verify Tables Created
Check that these tables exist:
- lab_test_catalog (should have 40+ rows after seeding)
- lab_results
- lab_values
- lab_patterns
- lab_protocols
- cgm_data
- lab_comparisons
- pattern_library

## Deployment Steps 🚀

### 1. Trigger Vercel Deployment
```bash
vercel --prod
```

Or push to main branch (auto-deploys)

### 2. Verify Deployment
After deployment completes (~2-3 minutes):
1. Visit: https://nutrition-lab-system-lets-truck.vercel.app/lab-analysis
2. Check that page loads without errors
3. Test authentication works

### 3. Test Core Functions
1. **Upload Test**: 
   - Click "Upload Lab Results"
   - Try uploading a test PDF
   - Verify processing starts

2. **API Health Check**:
   ```bash
   curl https://nutrition-lab-system-lets-truck.vercel.app/api/lab-analysis/patterns
   ```

3. **Dashboard Access**:
   - Login with existing account
   - Navigate to /lab-analysis
   - Verify all tabs load

## Post-Deployment Verification ✔️

### 1. Monitoring
- [ ] Check Vercel Functions logs for errors
- [ ] Monitor Supabase logs for database issues
- [ ] Verify OCR processing works
- [ ] Test AI analysis completes

### 2. Performance
- [ ] Page load time < 3 seconds
- [ ] File upload responsive
- [ ] API responses < 2 seconds

### 3. Security
- [ ] Authentication required for all endpoints
- [ ] File uploads limited to authenticated users
- [ ] No sensitive data in logs

## Rollback Plan 🔄

If issues occur:
```bash
# Quick rollback to previous stable version
git checkout v2.0.0-multi-doc-naq
vercel --prod
```

## Known Deployment Considerations

1. **OCR Processing**: Tesseract.js runs client-side, may be slow on large PDFs
2. **File Size**: Limited to 10MB per file
3. **API Rate Limits**: Claude API has rate limits, monitor usage
4. **Storage**: Supabase free tier has 1GB limit

## Support Contacts

- **Technical Issues**: Check Vercel deployment logs
- **Database Issues**: Supabase dashboard logs
- **AI Issues**: Anthropic API dashboard

## Success Metrics

After 24 hours, verify:
- [ ] No critical errors in logs
- [ ] Successful lab uploads
- [ ] Pattern detection working
- [ ] Protocols generating correctly
- [ ] Users can access reports