# Call Recording & Transcription System Setup Guide

## Overview
This AI-powered call recording system allows you to:
- Record calls with clients directly in the browser
- Automatically transcribe calls using OpenAI Whisper
- Extract structured health insights using Claude AI
- Store recordings securely in Supabase

## Prerequisites

### 1. Environment Variables
Add these to your `.env.local` file:

```env
# OpenAI API (for Whisper transcription)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

The system already uses your existing:
- `ANTHROPIC_API_KEY` - For Claude AI analysis
- Supabase credentials - For storage and database

### 2. Database Setup
Run the migration script to create the necessary tables:

```bash
# Using the Supabase SQL editor or CLI
psql $DATABASE_URL < scripts/db-migration-calls.sql
```

### 3. Storage Bucket Setup
Create the storage bucket for call recordings:

```bash
npm run storage:init-calls
# or
node scripts/init-call-recordings-storage.js
```

## Integration Guide

### Basic Integration
Add the call recording feature to any client page:

```tsx
import { CallRecordingIntegration } from '@/components/calls/CallRecordingIntegration'

// In your component
<CallRecordingIntegration 
  clientId={clientId}
  clientName={clientName}
/>
```

### Custom Integration
For more control, use the individual components:

```tsx
import { CallConsentDialog } from '@/components/calls/CallConsentDialog'
import { CallRecorder } from '@/components/calls/CallRecorder'
import { CallNotesSummary } from '@/components/calls/CallNotesSummary'

// Handle consent
<CallConsentDialog
  clientName="John Doe"
  onConsent={handleConsent}
  onDecline={handleDecline}
/>

// Record call
<CallRecorder
  clientId={clientId}
  callType="follow_up"
  onRecordingComplete={handleRecordingComplete}
/>

// Display summary
<CallNotesSummary callRecording={callRecording} />
```

## Features

### Call Types
- **Onboarding**: Initial client calls
- **Follow-up**: Regular check-ins
- **Assessment**: Detailed health assessments

### AI Analysis Extracts
- Health updates (new symptoms, changes)
- Lifestyle factors (driving, sleep, diet, exercise)
- Concerns and worries
- Action items and next steps
- Priority level (urgent, high, normal, low)

### Security Features
- Consent required before recording
- RLS (Row Level Security) enabled
- Secure storage with signed URLs
- HIPAA-compliant data handling

## API Endpoint

### Process Recording
`POST /api/calls/process-recording`

FormData parameters:
- `audio`: Audio file (Blob)
- `clientId`: Client UUID
- `callType`: Call type
- `duration`: Recording duration in seconds

Response:
```json
{
  "success": true,
  "callRecordingId": "uuid",
  "summary": {
    "callSummary": "...",
    "healthUpdates": {...},
    "lifestyleFactors": {...},
    "concerns": [...],
    "actionItems": [...],
    "nextSteps": "...",
    "priority": "normal"
  }
}
```

## Troubleshooting

### Microphone Access
- Ensure the app is served over HTTPS in production
- Check browser permissions for microphone access
- Test with different browsers if issues persist

### Transcription Errors
- Verify OpenAI API key is valid
- Check API quota and billing
- Ensure audio quality is sufficient

### Storage Issues
- Verify bucket exists and policies are set
- Check file size limits (500MB max)
- Ensure proper MIME types for audio files

## Development Tips

### Testing Locally
1. Use ngrok or similar for HTTPS during development
2. Test with short recordings first
3. Monitor browser console for errors
4. Check Supabase logs for storage issues

### Performance Optimization
- Recordings are chunked every second
- Audio is compressed with opus codec
- Large files are streamed, not loaded entirely

### Customization
- Modify AI prompts in the API route
- Adjust audio quality settings in CallRecorder
- Customize UI themes in components
- Add additional call types as needed