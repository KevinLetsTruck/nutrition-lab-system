# AWS Textract Setup Guide

## 1. Create AWS Account and Get Credentials

### Step 1: Create IAM User
1. Go to AWS Console → IAM → Users → Add User
2. User name: `textract-service-user`
3. Select "Programmatic access"
4. Attach policy: `AmazonTextractFullAccess`
5. Save the Access Key ID and Secret Access Key

### Step 2: Add to Environment Variables

Add these to your `.env.local` file:

```env
# AWS Textract Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

For Vercel deployment, add these in:
Settings → Environment Variables → Add New

## 2. Test the Configuration

Run this test script:

```bash
node scripts/test-textract.js
```

## 3. Cost Management

### Set up AWS Budget Alert
1. Go to AWS Billing → Budgets
2. Create budget: $20/month for Textract
3. Set alert at 80% usage

### Pricing
- $1.50 per 1000 pages for AnalyzeDocument
- First 1000 pages/month are FREE (Free Tier)

## 4. Usage in Application

The system automatically uses Textract when AWS credentials are present.
If not configured, it falls back to Claude Vision.

### Check if Textract is Active

Visit: `/api/analyze-enhanced`

Response will show:
```json
{
  "features": {
    "textract": "configured",  // or "not configured"
    "fallback": "claude-vision"
  }
}
```

## 5. Monitoring

### CloudWatch Metrics
- Monitor API calls in AWS Console → CloudWatch
- Set alarms for unusual usage

### Application Logs
- Check Vercel logs for `[TEXTRACT]` entries
- Monitor extraction confidence scores

## Security Best Practices

1. **Limit IAM Permissions**
   - Only grant Textract permissions
   - Use specific resource ARNs if possible

2. **Rotate Keys Regularly**
   - Rotate AWS keys every 90 days
   - Update in Vercel when rotated

3. **Monitor Usage**
   - Check AWS Cost Explorer weekly
   - Review CloudTrail logs monthly