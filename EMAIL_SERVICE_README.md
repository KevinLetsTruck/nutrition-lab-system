# FNTP Email Service Integration Documentation

## 🚀 Overview

The FNTP Email Service provides professional email delivery for protocol documents using Resend. It integrates seamlessly with the PDF generation service to deliver branded protocol documents directly to clients with automated follow-up capabilities.

## 📋 Features

### **Professional Email Templates**
- ✅ **Branded Design**: Green header matching PDF design (#10b981)
- ✅ **Mobile Responsive**: Optimized for all devices and email clients
- ✅ **Protocol Summary**: Key details with supplement count and timeline
- ✅ **PDF Attachments**: Automatic protocol document attachment
- ✅ **Implementation Guide**: Clear instructions for client adherence
- ✅ **Practitioner Branding**: Contact info and practice customization

### **Email Automation**
- **Protocol Delivery**: Complete protocols with PDF attachments
- **Follow-up Reminders**: Automated adherence check-ins
- **Progress Check-ins**: Scheduled wellness assessments
- **Protocol Adjustments**: Updated recommendations delivery
- **Multi-recipient Support**: Include family members in communications

### **Delivery Tracking**
- **Real-time Status**: Track email delivery and opens
- **Database Audit Trail**: Complete email history with metadata
- **Resend Dashboard**: Advanced analytics and bounce management
- **Performance Metrics**: Send times and attachment handling

---

## 🔧 Environment Configuration

### **Required Environment Variables**

Add these variables to your `.env.local` (development) or Railway environment (production):

```env
# Resend Configuration (Required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
FROM_EMAIL=protocols@yourpractice.com
FROM_NAME=Your Nutrition Practice

# Practice Information (Required)
PRACTICE_NAME=Functional Nutrition Practice
PRACTITIONER_NAME=Dr. Jane Smith
PRACTITIONER_EMAIL=jane@yourpractice.com
PRACTITIONER_PHONE=+1-555-123-4567

# Optional Branding
PRACTICE_LOGO_URL=https://yourpractice.com/logo.png
PRACTICE_WEBSITE=https://yourpractice.com
PRIMARY_COLOR=#10b981
REPLY_TO_EMAIL=support@yourpractice.com

# Email Configuration (Optional)
EMAIL_DAILY_LIMIT=100
EMAIL_MONTHLY_LIMIT=3000
EMAIL_TEST_MODE=true
SUPPORT_EMAIL=support@yourpractice.com
```

### **Variable Descriptions**

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | ✅ | API key from Resend dashboard |
| `FROM_EMAIL` | ✅ | Must be from verified domain |
| `FROM_NAME` | ✅ | Display name for sender |
| `PRACTICE_NAME` | ✅ | Your practice name |
| `PRACTITIONER_NAME` | ✅ | Primary practitioner name |
| `PRACTITIONER_EMAIL` | ✅ | Contact email for replies |
| `PRACTITIONER_PHONE` | ⚪ | Phone for client contact |
| `PRACTICE_LOGO_URL` | ⚪ | Logo for email header |
| `PRIMARY_COLOR` | ⚪ | Brand color (default: #10b981) |
| `EMAIL_TEST_MODE` | ⚪ | `true` for dev, `false` for production |

---

## 🔧 Resend Account Setup

### **1. Create Resend Account**
1. Visit https://resend.com and sign up
2. Verify your email address
3. Complete account setup

### **2. Domain Verification**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourpractice.com`)
4. Add the provided DNS records to your domain:
   ```
   Type: TXT
   Name: @
   Value: resend-verification=xxx
   
   Type: MX
   Name: @
   Value: feedback-smtp.resend.com
   Priority: 10
   ```
5. Wait for verification (usually 5-15 minutes)

### **3. Generate API Key**
1. Navigate to **API Keys** in dashboard
2. Click **Create API Key**
3. Name: `FNTP Protocol System`
4. Permission: **Sending access**
5. Domain: Select your verified domain
6. Copy the API key (starts with `re_`)

### **4. Configure FROM_EMAIL**
Your `FROM_EMAIL` must use your verified domain:
```env
FROM_EMAIL=protocols@yourpractice.com
```

**Note**: Free Resend accounts can send from `onboarding@resend.dev` for testing.

---

## 🎯 API Usage

### **Send Protocol Email**
**POST** `/api/protocols/[id]/email`

**Authentication**: Bearer token required

### **Basic Protocol Delivery**
```bash
curl -X POST \
  http://localhost:3000/api/protocols/[PROTOCOL_ID]/email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["client@example.com"],
    "includePDF": true,
    "includeGreeting": true,
    "includeSupplements": true,
    "customMessage": "Your personalized protocol is ready!"
  }'
```

### **Follow-up Reminder**
```bash
curl -X POST \
  http://localhost:3000/api/protocols/[PROTOCOL_ID]/email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["client@example.com"],
    "followUpType": "reminder",
    "daysOnProtocol": 7,
    "customMessage": "How are you feeling on your protocol?"
  }'
```

### **Multiple Recipients**
```bash
curl -X POST \
  http://localhost:3000/api/protocols/[PROTOCOL_ID]/email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["client@example.com"],
    "additionalRecipients": ["spouse@example.com", "adult-child@example.com"],
    "includePDF": true,
    "customMessage": "Sharing with family members as requested."
  }'
```

### **Request Body Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `recipients` | String[] | Primary recipients (required) |
| `additionalRecipients` | String[] | Additional recipients |
| `includePDF` | Boolean | Include protocol PDF (default: true) |
| `includeGreeting` | Boolean | Include greeting section |
| `includeSupplements` | Boolean | Include supplements section |
| `includeSchedule` | Boolean | Include daily schedule |
| `customMessage` | String | Personal message from practitioner |
| `subject` | String | Custom email subject |
| `followUpType` | String | Type: 'reminder', 'check-in', 'adjustment' |
| `daysOnProtocol` | Number | Days client has been on protocol |
| `testMode` | Boolean | Test mode (won't actually send) |
| `primaryColor` | String | Custom brand color |
| `practiceName` | String | Override practice name |
| `practitionerName` | String | Override practitioner name |
| `practitionerEmail` | String | Override practitioner email |

### **Success Response**
```json
{
  "success": true,
  "data": {
    "generationId": "gen_abc123xyz",
    "emailId": "re_abc123xyz456",
    "trackingId": "protocol_xyz_client_timestamp_abc123",
    "status": "sent",
    "message": "Protocol email sent successfully",
    "delivery": {
      "sentAt": "2025-08-28T12:34:56.789Z",
      "recipients": ["client@example.com"],
      "recipientCount": 1,
      "subject": "Your Personalized Protocol: Digestive Health Protocol",
      "provider": "resend",
      "deliveryStatus": "sent"
    },
    "protocol": {
      "id": "protocol_id",
      "name": "Digestive Health Protocol", 
      "clientName": "John Doe",
      "supplementCount": 4
    },
    "pdf": {
      "included": true,
      "filename": "Digestive_Health_Protocol_John_Doe.pdf",
      "size": "2.31 MB",
      "pages": 3,
      "source": "existing"
    },
    "performance": {
      "totalTime": 3456,
      "emailSendTime": "2025-08-28T12:34:56.789Z",
      "pdfGenerationIncluded": false
    }
  }
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Failed to send protocol email",
  "details": "Invalid recipient email address",
  "processingTime": 1234
}
```

---

## 🎨 Email Template Features

### **Professional Design**
- **Green Header**: Matches PDF sidebar design (#10b981)
- **Practice Branding**: Logo, name, and contact information
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Print Optimization**: Clean printing if clients need hard copies

### **Protocol Summary Section**
- **Protocol Status**: Visual status badges (Active, Planned, Completed)
- **Supplement Count**: Priority supplement recommendations
- **Duration**: Protocol timeline and phase information  
- **Start Date**: When to begin implementation

### **PDF Attachment Display**
- **File Information**: Name, size, and page count
- **Download Instructions**: Clear guidance for accessing PDF
- **Mobile Compatibility**: Works across all email clients

### **Implementation Guidance**
- **Step-by-Step Instructions**: How to follow the protocol
- **Timing Guidelines**: When to take supplements and follow schedule
- **Progress Tracking**: How to monitor improvements
- **Support Contact**: Direct practitioner contact information

### **Follow-up Templates**
- **Reminder Emails**: Gentle adherence reminders
- **Check-in Emails**: Progress assessment requests
- **Adjustment Emails**: Updated protocol notifications
- **Custom Timing**: Configurable follow-up schedules

---

## 🔗 System Integration

### **PDF Service Integration**
The email service seamlessly integrates with the PDF generation system:

1. **Automatic Attachment**: Existing PDFs are attached automatically
2. **On-Demand Generation**: New PDFs generated if needed
3. **File Optimization**: Proper sizing for email delivery
4. **Storage Efficiency**: Reuses existing generated PDFs

### **Database Tracking**
All email activity is tracked in the `ProtocolGeneration` table:

```sql
-- Email tracking fields
emailSentAt: DateTime?
emailRecipients: String[]
generationData: JSON -- Contains email metadata
```

### **UI Component Integration**
Email functionality is built into existing Protocol components:

- **ProtocolCard**: "Email Client" button
- **ProtocolBuilder**: "Send Email" action
- **ProtocolList**: Bulk email actions
- **Loading States**: Real-time sending feedback
- **Error Handling**: Toast notifications for issues

---

## 📊 Resend Dashboard Integration

### **Email Analytics**
Monitor email performance at https://resend.com/emails:

- **Delivery Status**: Sent, delivered, bounced, failed
- **Open Rates**: Email opens and engagement
- **Click Tracking**: Link clicks within emails
- **Bounce Management**: Handle failed deliveries
- **Spam Reports**: Monitor complaints and issues

### **Domain Health**
Track domain reputation and deliverability:

- **Authentication**: SPF, DKIM, DMARC status
- **Reputation Score**: Domain sending reputation
- **Bounce Rate**: Failed delivery percentage
- **Complaint Rate**: Spam report frequency

### **Usage Monitoring**
Track API usage and billing:

- **Email Volume**: Daily and monthly send counts
- **API Usage**: Request volume and rate limiting
- **Billing**: Usage-based pricing and limits
- **Webhooks**: Real-time delivery notifications (optional)

---

## 🧪 Testing

### **Development Testing**
1. Set `EMAIL_TEST_MODE=true` in environment
2. Use test protocol ID: `cmeunk5l40002v2exfz62uuv1`
3. Run test script:
   ```bash
   node scripts/test-email-service.js
   ```

### **Production Testing Checklist**
- [ ] Domain verified in Resend
- [ ] `FROM_EMAIL` using verified domain  
- [ ] `EMAIL_TEST_MODE=false`
- [ ] All practitioner information configured
- [ ] Practice branding configured
- [ ] Test email delivery to real addresses
- [ ] Check Resend dashboard for delivery confirmation
- [ ] Verify PDF attachments open correctly
- [ ] Test mobile email rendering
- [ ] Confirm practitioner contact links work

### **Test Scenarios**
```javascript
// Test basic delivery
const basicTest = {
  recipients: ["test@example.com"],
  includePDF: true,
  customMessage: "Test message"
};

// Test follow-up
const followUpTest = {
  recipients: ["test@example.com"], 
  followUpType: "reminder",
  daysOnProtocol: 7
};

// Test multiple recipients
const multiTest = {
  recipients: ["test@example.com"],
  additionalRecipients: ["family@example.com"]
};
```

---

## 🚨 Error Handling

### **Common Error Scenarios**

**Authentication Failure (401)**
```json
{ "success": false, "error": "Unauthorized" }
```

**Invalid Recipients (400)**
```json
{ 
  "success": false, 
  "error": "No valid email recipients provided",
  "details": "Email validation failed"
}
```

**Resend API Error (500)**
```json
{
  "success": false,
  "error": "Failed to send protocol email", 
  "details": "Resend API error: Domain not verified"
}
```

**PDF Generation Error (500)**
```json
{
  "success": false,
  "error": "PDF generation failed: Invalid protocol data"
}
```

### **Troubleshooting Guide**

1. **Verify Environment Variables**
   ```bash
   node scripts/test-email-service.js
   ```

2. **Check Domain Verification**
   - Visit Resend dashboard
   - Verify domain status is "Verified"
   - Check DNS records are properly configured

3. **Test API Key**
   - Ensure key starts with `re_`
   - Verify key has sending permissions
   - Check key is for correct domain

4. **Monitor Resend Dashboard**
   - Check recent email activity
   - Review bounce and complaint rates
   - Verify webhook configuration (if used)

---

## 🔒 Security & Compliance

### **Data Protection**
- **PHI Handling**: Email content contains health information
- **Secure Transmission**: TLS encryption for all emails
- **Access Control**: JWT authentication required for API
- **Audit Trail**: Complete email history in database

### **HIPAA Considerations**
- **Business Associate**: Resend may require BAA for PHI
- **Encryption**: All emails encrypted in transit
- **Access Logs**: Complete audit trail maintained
- **Data Retention**: Configure appropriate retention periods

### **Rate Limiting**
- **Daily Limits**: Configurable via `EMAIL_DAILY_LIMIT`
- **Monthly Limits**: Configurable via `EMAIL_MONTHLY_LIMIT`
- **API Limits**: Resend enforces API rate limits
- **Attachment Size**: 25MB maximum per email

---

## 📈 Production Deployment

### **Railway Environment Setup**
1. Go to your Railway project dashboard
2. Navigate to **Variables** tab
3. Add all required environment variables:
   ```
   RESEND_API_KEY = re_your_actual_api_key
   FROM_EMAIL = protocols@yourpractice.com
   FROM_NAME = Your Practice Name
   PRACTICE_NAME = Your Full Practice Name
   PRACTITIONER_NAME = Dr. Your Name
   PRACTITIONER_EMAIL = you@yourpractice.com
   EMAIL_TEST_MODE = false
   ```

### **Domain Configuration**
1. Purchase and configure your domain
2. Add DNS records for Resend verification
3. Update `FROM_EMAIL` to use your domain
4. Test email delivery after deployment

### **Monitoring Setup**
1. Configure Resend webhooks (optional)
2. Set up email monitoring alerts
3. Monitor bounce and complaint rates
4. Track email delivery success rates

---

## 📞 Support & Troubleshooting

### **Debug Checklist**
1. ✅ `RESEND_API_KEY` configured correctly
2. ✅ Domain verified in Resend dashboard
3. ✅ `FROM_EMAIL` uses verified domain
4. ✅ JWT token valid and not expired
5. ✅ Protocol exists and has supplements
6. ✅ Client email addresses are valid
7. ✅ No rate limits exceeded
8. ✅ PDF generation working properly

### **Log Analysis**
Check browser console and server logs for:
- Authentication errors
- Resend API responses  
- PDF generation issues
- Email validation failures
- Database connection problems

### **Performance Optimization**
- **PDF Reuse**: Existing PDFs attached without regeneration
- **Batch Processing**: Multiple recipients in single API call
- **Async Operations**: Non-blocking email sending
- **Error Recovery**: Automatic retry with exponential backoff

---

## 🚀 Future Enhancements

### **Planned Features**
- [ ] **Email Templates**: Custom templates per practice
- [ ] **Scheduled Sending**: Delayed email delivery
- [ ] **A/B Testing**: Template performance comparison
- [ ] **Automated Sequences**: Multi-email follow-up campaigns
- [ ] **Client Preferences**: Email frequency and content preferences
- [ ] **Analytics Dashboard**: Built-in email performance tracking

### **Advanced Integration**
- [ ] **CRM Integration**: Sync with external CRM systems
- [ ] **Calendar Integration**: Schedule follow-ups automatically
- [ ] **SMS Integration**: Multi-channel communication
- [ ] **White Labeling**: Complete practice customization

---

## 📋 Quick Reference

### **Environment Variables Template**
```env
# Copy this template to your .env.local file
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=protocols@yourpractice.com
FROM_NAME=Your Practice Name
PRACTICE_NAME=Your Full Practice Name  
PRACTITIONER_NAME=Dr. Your Name
PRACTITIONER_EMAIL=you@yourpractice.com
PRACTITIONER_PHONE=+1-555-123-4567
PRACTICE_LOGO_URL=https://yourpractice.com/logo.png
EMAIL_TEST_MODE=true
```

### **API Quick Test**
```bash
# Replace [TOKEN] and [PROTOCOL_ID] with actual values
curl -X POST http://localhost:3000/api/protocols/[PROTOCOL_ID]/email \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"recipients":["test@example.com"],"includePDF":true}'
```

### **Component Integration**
```typescript
// Use in React components
const handleSendEmail = async () => {
  const response = await fetch(`/api/protocols/${protocolId}/email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipients: [client.email],
      includePDF: true,
      customMessage: message
    })
  });
};
```

---

*Last Updated: August 28, 2025*  
*Version: 1.0.0*  
*System: FNTP Protocol Development System*  
*Email Provider: Resend*  
*Integration: Complete Protocol Workflow*
