# Document Upload Solution

## 🚀 Quick Start - Use the Simple Upload

I've created a simplified upload system that **works without AWS Textract**:

### 1. Go to the Test Upload Page
Navigate to: `/test-upload`

### 2. Use the Simple Upload Component
- Enter client email (required)
- Enter first/last name (optional)
- Select a PDF file
- Click "Upload Document"

## 🔧 How It Works

The new simplified system:
1. **No AWS Required** - Uses `pdf-parse` library for text extraction
2. **Automatic Fallback** - If text extraction fails, uses AI analysis
3. **Clear Error Messages** - Shows exactly what went wrong
4. **Progress Tracking** - See upload and analysis status

## 📋 Troubleshooting Steps

### Step 1: Run the Diagnostic Script
```bash
npx tsx scripts/test-document-upload.ts
```

This will check:
- ✅ Environment variables
- ✅ AWS credentials (if configured)
- ✅ File system setup
- ✅ Provide setup instructions

### Step 2: Check Your PDF
Best results with:
- Text-based PDFs (not scanned images)
- File size under 10MB
- Not password-protected
- Standard lab report format

### Step 3: Use the Right Endpoint
- **Simple Upload** (Recommended): `/api/upload-simple`
  - Works without AWS
  - Best for text-based PDFs
  - Clear error messages

- **Enhanced Upload** (If AWS configured): `/api/analyze-enhanced`
  - Requires AWS Textract
  - Better for scanned PDFs
  - More complex setup

## 🔐 AWS Setup (Optional)

If you want to use AWS Textract for scanned PDFs:

### 1. Create AWS Account
- Go to https://aws.amazon.com
- Sign up for free tier

### 2. Create IAM User
```
1. AWS Console → IAM → Users → Add User
2. User name: nutrition-lab-textract
3. Access type: Programmatic access
4. Attach policy: AmazonTextractFullAccess
5. Create user
6. Save credentials
```

### 3. Add to .env.local
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

## 📊 Current Status

### What's Working:
- ✅ Simple upload endpoint (`/api/upload-simple`)
- ✅ PDF text extraction with `pdf-parse`
- ✅ File storage in Supabase
- ✅ Basic document analysis
- ✅ Client creation/association

### What Needs AWS:
- ❌ Scanned/image-based PDFs
- ❌ Complex table extraction
- ❌ Handwritten text

## 🛠️ API Endpoints

### 1. Simple Upload (No AWS)
```
POST /api/upload-simple
Content-Type: multipart/form-data

Fields:
- file: PDF file
- clientEmail: client@example.com
- clientFirstName: John (optional)
- clientLastName: Doe (optional)
```

### 2. Test Upload Page
```
GET /test-upload
```

### 3. Diagnostic Script
```bash
npx tsx scripts/test-document-upload.ts
```

## 🐛 Common Issues & Solutions

### Issue: "Analysis failed"
**Solution**: Ensure PDF is text-based, not a scanned image

### Issue: "No text extracted"
**Solution**: Try a different PDF or configure AWS Textract

### Issue: "Upload failed"
**Solution**: Check file size (<10MB) and ensure it's a valid PDF

### Issue: "Client email required"
**Solution**: Always provide a valid email address

## 📈 Next Steps

1. **Test with Simple PDFs First**
   - Use the `/test-upload` page
   - Start with text-based PDFs
   - Check browser console for errors

2. **Monitor Logs**
   - Browser console shows client-side errors
   - Server logs show processing details
   - Check Supabase logs for storage issues

3. **Gradual Complexity**
   - Start: Simple text PDFs
   - Next: Complex layouts
   - Advanced: Scanned images (requires AWS)

## 💡 Tips for Success

1. **Use Chrome DevTools**
   - Open Console (F12)
   - Watch for detailed error messages
   - Check Network tab for failed requests

2. **Test PDFs**
   - Download a sample NutriQ report
   - Ensure it's not corrupted
   - Try multiple formats

3. **Incremental Testing**
   - Upload → Check storage
   - Extract → Check text
   - Analyze → Check results

## 🆘 Emergency Fallback

If nothing works:
1. Use `/test-upload` page
2. Upload a simple text PDF
3. Check browser console
4. Share the error message

The simplified system should work for 90% of cases without AWS!