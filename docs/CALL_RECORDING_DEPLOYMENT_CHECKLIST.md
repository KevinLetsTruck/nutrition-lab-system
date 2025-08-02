# Call Recording System - Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Variables
- [ ] Add `OPENAI_API_KEY` to your production environment (Vercel/hosting platform)
- [ ] Verify `ANTHROPIC_API_KEY` is already configured
- [ ] Confirm all Supabase credentials are set

### 2. Database Migration
- [ ] Run the call recording migration script in production:
  ```sql
  -- Run scripts/db-migration-calls.sql in Supabase SQL editor
  ```
- [ ] Verify tables created: `call_recordings`, `call_notes`
- [ ] Confirm RLS policies are active

### 3. Storage Bucket
- [ ] Create `call-recordings` bucket in Supabase Storage
- [ ] Set bucket to private (not public)
- [ ] Configure storage policies for authenticated access
- [ ] Set file size limit to 500MB
- [ ] Configure allowed MIME types for audio files

### 4. API Keys
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Ensure billing is enabled on OpenAI account
- [ ] Test Whisper API access with a small audio file

## Integration Steps

### 5. Code Integration
- [ ] Import `CallRecordingIntegration` component in client pages
- [ ] Add call recording section/tab to client detail pages
- [ ] Ensure proper client ID and name are passed as props

### 6. UI/UX Verification
- [ ] Test consent dialog appears before recording
- [ ] Verify recording indicator shows audio levels
- [ ] Check that call history displays correctly
- [ ] Ensure AI summaries render properly

## Testing Checklist

### 7. Functionality Tests
- [ ] Test microphone permission request
- [ ] Record a short test call
- [ ] Verify audio uploads to storage
- [ ] Check transcription completes
- [ ] Confirm AI analysis generates summary
- [ ] Test viewing call history

### 8. Edge Cases
- [ ] Test with denied microphone permission
- [ ] Try pausing and resuming recording
- [ ] Test with poor internet connection
- [ ] Verify error handling for failed transcription
- [ ] Check behavior with very short recordings

## Security Verification

### 9. Access Control
- [ ] Verify users can only see their own recordings
- [ ] Test RLS policies are enforced
- [ ] Confirm storage URLs are signed/protected
- [ ] Check API routes require authentication

### 10. Compliance
- [ ] Ensure consent is tracked in database
- [ ] Verify HIPAA compliance measures
- [ ] Test data deletion capabilities
- [ ] Document retention policies

## Performance Checks

### 11. Optimization
- [ ] Test with recordings up to 30 minutes
- [ ] Monitor API response times
- [ ] Check storage upload speeds
- [ ] Verify no memory leaks in recording

### 12. Monitoring
- [ ] Set up error tracking for failed recordings
- [ ] Monitor OpenAI API usage/costs
- [ ] Track storage usage growth
- [ ] Set alerts for failed transcriptions

## Post-Deployment

### 13. Documentation
- [ ] Update user documentation with call recording feature
- [ ] Train staff on using the system
- [ ] Document troubleshooting steps
- [ ] Create FAQ for common issues

### 14. Maintenance
- [ ] Plan for storage cleanup policy
- [ ] Set up backup procedures
- [ ] Monitor API rate limits
- [ ] Review costs monthly

## Rollback Plan

If issues arise:
1. Disable call recording feature flag (if implemented)
2. Remove call recording UI components
3. Keep database tables (no data loss)
4. Address issues before re-enabling

## Success Metrics

Track after deployment:
- Number of calls recorded per day
- Average transcription accuracy
- User adoption rate
- Time saved vs manual notes
- Client satisfaction scores