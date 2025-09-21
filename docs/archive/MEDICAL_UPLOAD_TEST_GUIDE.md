# Medical Document Upload Test Guide

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the test page:**
   ```
   http://localhost:3000/test-medical
   ```

3. **Test the endpoints:**
   ```bash
   node test-medical-endpoints.js
   ```

## 🧪 Test Page Features

### ✅ Upload Interface
- **File Input:** Accepts PDF, JPEG, PNG, TIFF files up to 50MB
- **Client Selection:** Dropdown of existing clients from database
- **Document Type:** Lab Report, Imaging, Clinical Notes, etc.
- **Radio Show Option:** Special flag for radio show uploads
- **File Preview:** Shows file details and image previews

### 📊 Status & Debugging
- **Upload Progress:** Real-time progress bar during upload
- **Response Display:** Full API response with success/error details
- **Error Suggestions:** Helpful suggestions for fixing common issues
- **Debug Info:** Endpoint details, auth info, and timestamps
- **Console Logging:** Detailed logs for debugging

### 🔧 Error Handling
- **File Validation:** Size, type, and format validation
- **Authentication:** JWT token validation
- **Client Validation:** Ensures selected client exists
- **Network Errors:** Handles connection and server issues
- **Specific Messages:** Detailed error messages with suggestions

## 🎯 Testing Scenarios

### ✅ Success Cases
1. **Valid PDF Upload:**
   - Select client
   - Choose PDF lab report
   - Upload successfully
   - Verify database entry

2. **Image Upload:**
   - Select JPEG/PNG image
   - Upload with preview
   - Check processing status

3. **Radio Show Upload:**
   - Enable radio show option
   - Upload document
   - Verify special labSource flag

### ❌ Error Cases
1. **No Client Selected:**
   - Try upload without client
   - Should show validation error

2. **Invalid File Type:**
   - Upload .txt or .doc file
   - Should show file type error

3. **File Too Large:**
   - Upload >50MB file
   - Should show size error

4. **No Authentication:**
   - Clear JWT token
   - Should show auth error

## 🔍 API Endpoints Being Tested

### POST /api/medical/upload
- **Purpose:** Upload medical documents
- **Auth:** Bearer JWT token
- **Content-Type:** multipart/form-data
- **Form Fields:**
  - `file`: The document file
  - `clientId`: ID of the client
  - `documentType`: Type of document
  - `labSource`: Optional lab source

### GET /api/clients
- **Purpose:** Fetch available clients for dropdown
- **Auth:** Bearer JWT token
- **Response:** List of clients with id, name, email

## 🛠️ Debugging Tips

### Check Console Logs
The test page logs detailed information:
```javascript
// File selection details
console.log('File selected:', { name, size, type, lastModified });

// Upload request details
console.log('Starting upload with data:', { fileName, clientId, documentType });

// API response details
console.log('Upload response:', { status, headers, body });
```

### Common Issues & Solutions

1. **"Authentication failed"**
   - Update JWT token in the test page
   - Check if login is working
   - Verify JWT_SECRET in .env

2. **"Client not found"**
   - Check if clients exist in database
   - Verify client IDs are correct
   - Test /api/clients endpoint

3. **"File type not allowed"**
   - Use PDF, JPEG, PNG, or TIFF files
   - Check file extension
   - Verify MIME type

4. **"Database connection error"**
   - Check DATABASE_URL in .env
   - Verify PostgreSQL is running
   - Check Prisma connection

## 📁 Test Files

### Create Test Documents
1. **PDF Lab Report:** Use any PDF file for testing
2. **Lab Image:** Take photo of lab results with phone
3. **Large File:** Create >50MB file to test size limit
4. **Invalid File:** Use .txt file to test validation

### Sample File Structure
```
test-files/
├── lab-report.pdf          # Valid PDF test
├── lab-results.jpg         # Valid image test
├── large-file.pdf          # Size limit test
└── invalid-file.txt        # Type validation test
```

## 🎨 UI Features

### Dark Theme Design
- Consistent with existing FNTP design
- Gray-900 background with dark cards
- Blue accent colors for actions
- Proper contrast for readability

### Responsive Layout
- Two-column layout on desktop
- Single column on mobile
- Proper spacing and typography
- Accessible form controls

### Interactive Elements
- File drag-and-drop support
- Progress indicators
- Toast notifications
- Responsive buttons
- Form validation feedback

## 🔄 Workflow Testing

### Complete Upload Flow
1. Start server and open test page
2. Select client from dropdown
3. Choose document type
4. Select file with preview
5. Click upload and watch progress
6. Review response and status
7. Check database for new record
8. Test processing endpoints

### Integration Testing
```bash
# Test database integration
node test-medical-integration.js

# Test API endpoints
node test-medical-endpoints.js

# Test full upload workflow
# (Use the web interface)
```

## 📊 Success Metrics

### What to Verify
- ✅ File uploads without errors
- ✅ Database records created correctly
- ✅ Processing queue entries added
- ✅ Client relationships working
- ✅ Error handling functioning
- ✅ Progress feedback working
- ✅ Response data accurate

### Database Checks
After successful upload, verify:
```sql
-- Check medical document was created
SELECT * FROM medical_documents ORDER BY upload_date DESC LIMIT 1;

-- Check processing queue entry
SELECT * FROM medical_processing_queue ORDER BY created_at DESC LIMIT 1;

-- Check client relationship
SELECT c.first_name, c.last_name, md.original_file_name 
FROM clients c 
JOIN medical_documents md ON c.id = md.client_id;
```

## 🎉 Ready to Test!

The medical document upload system is now ready for comprehensive testing. Use this test page to validate all functionality before moving to production!

**Test Page URL:** http://localhost:3000/test-medical
