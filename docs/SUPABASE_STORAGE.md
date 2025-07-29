# Supabase Storage Integration

This document describes the complete Supabase Storage integration for the Nutrition Lab Management System, which replaces local file storage with cloud-based storage for production deployment.

## 🎯 Overview

The system now uses Supabase Storage instead of local file system storage to ensure compatibility with serverless environments like Vercel. All file uploads, storage, and retrieval operations are handled through Supabase Storage buckets.

## 🏗️ Architecture

### Storage Buckets

The system uses the following storage buckets, each optimized for specific file types:

| Bucket | Purpose | Allowed File Types | Size Limit |
|--------|---------|-------------------|------------|
| `lab-files` | Lab reports (PDFs, images) | PDF, JPG, JPEG, PNG | 10MB |
| `cgm-images` | CGM data and glucose images | JPG, JPEG, PNG, CSV | 10MB |
| `food-photos` | Food photos and meal images | JPG, JPEG, PNG | 10MB |
| `medical-records` | Medical documents | PDF, JPG, JPEG, PNG | 10MB |
| `supplements` | Supplement photos | JPG, JPEG, PNG | 10MB |
| `general` | Other files | PDF, JPG, JPEG, PNG, CSV | 10MB |

### File Organization

Files are organized in a date-based structure:
```
bucket/
├── 2024/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── filename_1705276800000_abc123.pdf
│   │   │   └── filename_1705276800001_def456.jpg
│   │   └── 16/
│   └── 02/
└── 2025/
```

## 🚀 Setup Instructions

### 1. Environment Variables

Ensure these environment variables are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Initialize Storage Buckets

Run the storage initialization script:

```bash
npm run storage:init
```

This will:
- Create all necessary storage buckets
- Configure file type restrictions
- Set up size limits
- Configure security policies

### 3. Test Storage Integration

Verify the storage integration is working:

```bash
npm run storage:test
```

This comprehensive test will:
- Create test buckets
- Upload sample files
- Generate URLs
- Download files
- Verify content integrity
- Clean up test files

## 📁 File Operations

### Upload Files

```typescript
import { saveFile } from '@/lib/file-utils'

// Upload a file to Supabase Storage
const storageFile = await saveFile(
  fileBuffer,           // File buffer or File object
  'lab-report.pdf',     // Original filename
  'lab_reports',        // Category (optional)
  {                     // Metadata (optional)
    clientId: 'uuid',
    uploadedBy: 'api'
  }
)

// Result includes:
// {
//   path: '2024/01/15/lab-report_1705276800000_abc123.pdf',
//   url: 'https://...',
//   size: 1024000,
//   type: 'application/pdf',
//   bucket: 'lab-files',
//   metadata: { ... }
// }
```

### Download Files

```typescript
import { loadFile } from '@/lib/file-utils'

// Download file from Supabase Storage
const fileBuffer = await loadFile('lab-files', '2024/01/15/filename.pdf')

if (fileBuffer) {
  // Process the file buffer
  console.log('File downloaded:', fileBuffer.length, 'bytes')
}
```

### Get File URLs

```typescript
import { getFileUrl } from '@/lib/file-utils'

// Get public URL
const publicUrl = await getFileUrl('lab-files', '2024/01/15/filename.pdf')

// Get signed URL (expires in 1 hour)
const signedUrl = await getFileUrl('lab-files', '2024/01/15/filename.pdf', true)
```

### Delete Files

```typescript
import { deleteFile } from '@/lib/file-utils'

// Delete file from Supabase Storage
const success = await deleteFile('lab-files', '2024/01/15/filename.pdf')

if (success) {
  console.log('File deleted successfully')
}
```

## 🔧 API Integration

### Upload API (`/api/upload`)

The upload API now:

1. **Validates files** using the same validation logic
2. **Uploads to Supabase Storage** with proper categorization
3. **Creates database records** linking files to clients and lab reports
4. **Returns storage metadata** including URLs and paths

**Request:**
```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('clientEmail', 'client@example.com')
formData.append('clientFirstName', 'John')
formData.append('clientLastName', 'Doe')
formData.append('category', 'lab_reports') // Optional

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

**Response:**
```json
{
  "success": true,
  "uploaded": 1,
  "failed": 0,
  "files": [
    {
      "success": true,
      "filename": "lab-report.pdf",
      "originalName": "lab-report.pdf",
      "size": 1024000,
      "storagePath": "2024/01/15/lab-report_1705276800000_abc123.pdf",
      "storageUrl": "https://...",
      "bucket": "lab-files",
      "labReportId": "uuid",
      "clientEmail": "client@example.com",
      "clientFirstName": "John",
      "clientLastName": "Doe",
      "reportType": "nutriq"
    }
  ]
}
```

### Analysis API (`/api/analyze`)

The analysis API now:

1. **Retrieves lab reports** from the database
2. **Downloads files** from Supabase Storage
3. **Processes files** using the AI analyzers
4. **Updates database** with analysis results

**Request:**
```javascript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    labReportId: 'uuid' // Use labReportId instead of filename
  })
})
```

**Response:**
```json
{
  "success": true,
  "labReportId": "uuid",
  "analysis": {
    "reportType": "nutriq",
    "analyzedReport": { ... },
    "processingTime": 2500,
    "confidence": 0.85
  },
  "message": "Analysis completed successfully"
}
```

### Onboarding Uploads API (`/api/onboarding/uploads`)

The onboarding uploads API:

1. **Validates session tokens** for security
2. **Uploads files** to appropriate buckets
3. **Stores metadata** in client_files table
4. **Supports categorized uploads** for different file types

## 🔒 Security Features

### File Validation

- **File type validation** based on MIME type and extension
- **File size limits** (10MB per file)
- **Malicious file detection** through content analysis
- **Category-based restrictions** for different file types

### Access Control

- **Private buckets** by default (no public access)
- **Signed URLs** for temporary access when needed
- **Session-based authentication** for onboarding uploads
- **Rate limiting** on all upload endpoints

### Data Protection

- **Encrypted storage** at rest (Supabase handles this)
- **Secure file paths** with unique identifiers
- **Metadata sanitization** before storage
- **Audit trails** for all file operations

## 📊 Database Schema Updates

### Lab Reports Table

The `lab_reports` table now stores Supabase Storage paths:

```sql
ALTER TABLE lab_reports 
ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR(50),
ADD COLUMN IF NOT EXISTS storage_metadata JSONB;
```

### Client Files Table

The `client_files` table stores comprehensive file metadata:

```sql
CREATE TABLE client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

## 🧪 Testing

### Manual Testing

1. **Upload a file** through the web interface
2. **Check Supabase Storage** dashboard for the file
3. **Verify database records** are created correctly
4. **Test analysis** with the uploaded file
5. **Download the file** to verify integrity

### Automated Testing

Run the comprehensive test suite:

```bash
npm run storage:test
```

This tests:
- ✅ Bucket creation and configuration
- ✅ File upload and storage
- ✅ URL generation (public and signed)
- ✅ File download and content verification
- ✅ File deletion and cleanup
- ✅ Bucket listing and management

## 🚨 Troubleshooting

### Common Issues

**1. "Bucket not found" errors**
```bash
# Solution: Initialize storage buckets
npm run storage:init
```

**2. "File upload failed" errors**
- Check environment variables are set correctly
- Verify Supabase project has storage enabled
- Check file size and type restrictions

**3. "Analysis failed" errors**
- Verify file exists in storage
- Check file path in database records
- Ensure proper bucket permissions

**4. "Rate limit exceeded" errors**
- Wait for rate limit window to reset
- Check rate limiting configuration
- Consider implementing retry logic

### Debug Commands

```bash
# Check storage buckets
npm run storage:test

# Test database connection
npm run db:query test

# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

## 📈 Performance Considerations

### Optimization Tips

1. **Use appropriate bucket categories** for better organization
2. **Implement file compression** for large images
3. **Cache frequently accessed URLs** to reduce API calls
4. **Use signed URLs** for temporary access instead of public URLs
5. **Implement cleanup jobs** for old files

### Monitoring

- Monitor storage usage through Supabase dashboard
- Track upload/download performance
- Monitor rate limiting and error rates
- Set up alerts for storage quota limits

## 🔄 Migration from Local Storage

If migrating from local file storage:

1. **Backup existing files** from local storage
2. **Upload files to Supabase Storage** using the new system
3. **Update database records** with new storage paths
4. **Test file retrieval** and analysis
5. **Remove local storage dependencies**

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)
- [Storage Security Guide](https://supabase.com/docs/guides/storage/security)

---

**Note:** This storage integration ensures your nutrition lab system works seamlessly in production environments like Vercel, where local file storage is not available. 