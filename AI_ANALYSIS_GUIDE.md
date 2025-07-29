# AI-Powered Lab Report Analysis System

## Overview

Your nutrition lab system now includes a comprehensive AI-powered analysis system that can automatically process and analyze various types of lab reports using Claude AI. The system supports:

- **NutriQ/NAQ Assessments** - Body system scoring and recommendations
- **KBMO Food Intolerance Tests** - IgG sensitivity analysis and elimination diets
- **Dutch Hormone Tests** - Hormone pattern analysis and clinical recommendations
- **CGM Data** - Glucose pattern analysis and lifestyle recommendations
- **Food Photos** - Nutritional analysis and recommendations

## Quick Start

### 1. Environment Setup

Make sure you have the required environment variables in your `.env.local` file:

```bash
# Required for AI analysis
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional for email notifications
RESEND_API_KEY=your_resend_api_key_here
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Upload and Analyze a PDF

1. Place your PDF file in the `uploads/pdfs/` directory
2. Use the API endpoint to analyze it:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "your_report.pdf",
    "clientEmail": "client@example.com",
    "clientFirstName": "John",
    "clientLastName": "Doe",
    "clientDateOfBirth": "1985-03-15"
  }'
```

### 4. Batch Process Multiple PDFs

```bash
# Process all PDFs in uploads/pdfs/ directory
npm run process-pdfs client@example.com "John" "Doe" "1985-03-15"

# Or with just email
npm run process-pdfs client@example.com
```

## API Endpoints

### POST /api/analyze

Analyze a single PDF file.

**Request Body:**
```json
{
  "filename": "report.pdf",
  "clientEmail": "client@example.com",
  "clientFirstName": "John",
  "clientLastName": "Doe",
  "clientDateOfBirth": "1985-03-15"
}
```

**Response:**
```json
{
  "success": true,
  "labReportId": "uuid-here",
  "analysisResult": {
    "reportType": "nutriq",
    "confidence": 0.95,
    "processingTime": 2500,
    "summary": "Report Type: NUTRIQ\nConfidence: 95.0%\nPatient: John Doe\n..."
  },
  "message": "Analysis completed successfully"
}
```

### GET /api/analyze

Get analysis status and results.

**Query Parameters:**
- `id=uuid` - Get specific analysis by ID
- `client=email` - Get all reports for a client
- No parameters - Get pending analyses

## Database Commands

### View Analysis Results

```bash
# Show all analysis results (last 50)
npm run db:query analyze

# Show pending analyses
npm run db:query pending

# Show recent analyses (last 7 days)
npm run db:query recent

# Show client summary
npm run db:query summary
```

### Interactive Database Mode

```bash
npm run db:query
```

Then use commands like:
- `analyze` - Show analysis results
- `pending` - Show pending analyses
- `recent` - Show recent analyses
- `clients` - Show clients
- `reports` - Show lab reports

## Supported Report Types

### 1. NutriQ/NAQ Assessments

**What it analyzes:**
- Total health score (0-100)
- Body system scores (energy, mood, sleep, stress, digestion, immunity)
- Specific issues and recommendations for each system
- Priority actions and follow-up tests

**Database Storage:**
- Main analysis in `lab_reports.analysis_results`
- Structured data in `nutriq_results` table

### 2. KBMO Food Intolerance Tests

**What it analyzes:**
- IgG levels for different foods
- Categorization by sensitivity (high, moderate, low)
- Elimination diet recommendations
- Reintroduction schedule
- Cross-reactivity notes

**Database Storage:**
- Main analysis in `lab_reports.analysis_results`
- Structured data in `kbmo_results` table

### 3. Dutch Hormone Tests

**What it analyzes:**
- Cortisol pattern (AM/PM levels)
- Sex hormone levels (testosterone, estradiol, progesterone, DHEA)
- Organic acid metabolites
- Hormone imbalance interpretation
- Clinical recommendations

**Database Storage:**
- Main analysis in `lab_reports.analysis_results`
- Structured data in `dutch_results` table

### 4. CGM Data

**What it analyzes:**
- Average glucose levels
- Glucose variability
- Time in range percentage
- Hypoglycemic events
- Post-meal spikes
- Lifestyle recommendations

**Database Storage:**
- Analysis results in `lab_reports.analysis_results`
- Individual data points in `cgm_data` table

### 5. Food Photos

**What it analyzes:**
- Estimated calories
- Macro breakdown (protein, carbs, fat, fiber)
- Food item identification
- Nutritional quality assessment
- Recommendations

**Database Storage:**
- Analysis results in `lab_reports.analysis_results`
- Image data in `food_photos` table

## File Structure

```
src/lib/
├── claude-client.ts          # Claude AI integration
├── database-service.ts       # Database operations
├── email-service.ts          # Email notifications
└── lab-analyzers/
    ├── pdf-parser.ts         # Basic PDF parsing
    ├── master-analyzer.ts    # Main analysis orchestrator
    ├── nutriq-analyzer.ts    # NutriQ specific analysis
    ├── kbmo-analyzer.ts      # KBMO specific analysis
    └── dutch-analyzer.ts     # Dutch specific analysis

scripts/
├── process-pdfs.js           # Batch processing script
└── query-runner.js           # Database query tool
```

## Configuration

### Claude AI Configuration

The system uses Claude 3.5 Sonnet for analysis. Configure in `src/lib/claude-client.ts`:

```typescript
// Model configuration
model: 'claude-3-5-sonnet-20241022',
max_tokens: 4000,
```

### Email Notifications

Configure Resend for email notifications:

1. Get API key from [Resend](https://resend.com)
2. Add to `.env.local`:
   ```bash
   RESEND_API_KEY=re_123456789
   ```
3. Update sender email in `src/lib/email-service.ts`:
   ```typescript
   from: 'Nutrition Lab <noreply@yourdomain.com>'
   ```

### Batch Processing Configuration

Configure batch processing in `scripts/process-pdfs.js`:

```javascript
const BATCH_SIZE = 5 // Process 5 files at a time
const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds between batches
```

## Error Handling

### Analysis Validation

The system validates analysis results before saving:

- Minimum confidence score (70%)
- Required patient information
- Valid analysis structure
- Complete data extraction

### Retry Logic

Failed analyses are marked with status 'failed' and can be reprocessed:

```bash
# Check failed analyses
npm run db:query

# Then run: SELECT * FROM lab_reports WHERE status = 'failed';
```

### Error Logging

All errors are logged with detailed information:
- Analysis type and file
- Error message and stack trace
- Processing time and confidence scores

## Performance Optimization

### Batch Processing

- Process multiple files efficiently
- Rate limiting to avoid API limits
- Automatic file cleanup after processing

### Caching

- Singleton pattern for analyzers
- Reuse Claude client connections
- Database connection pooling

### Monitoring

Track processing metrics:
```bash
# View processing statistics
npm run db:query analyze
```

## Security Considerations

### API Key Management

- Store API keys in environment variables
- Never commit keys to version control
- Use service role keys for database access

### Data Privacy

- Client data is stored securely in Supabase
- Row-level security policies enabled
- Analysis results are client-specific

### File Handling

- Files are moved to processed directory after analysis
- No temporary files left in uploads directory
- File size limits enforced

## Troubleshooting

### Common Issues

1. **"ANTHROPIC_API_KEY environment variable is required"**
   - Add your Anthropic API key to `.env.local`

2. **"Analysis validation failed"**
   - Check PDF quality and format
   - Verify report type detection
   - Review confidence scores

3. **"Failed to save analysis result"**
   - Check database connection
   - Verify table structure
   - Review error logs

4. **"Email service not configured"**
   - Add RESEND_API_KEY to `.env.local`
   - Or ignore if email notifications not needed

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment variable
DEBUG=nutrition-lab:* npm run dev
```

### Testing

Test individual components:

```bash
# Test database connection
npm run db:query test

# Test email configuration
# (Add test method to email service)

# Test Claude integration
# (Upload a test PDF and check logs)
```

## Future Enhancements

### Planned Features

1. **Real-time Processing**
   - WebSocket notifications
   - Progress tracking
   - Live status updates

2. **Advanced Analytics**
   - Trend analysis across multiple reports
   - Comparative analysis between clients
   - Predictive recommendations

3. **Integration Enhancements**
   - Direct lab integration
   - EMR system connectivity
   - Mobile app support

4. **AI Improvements**
   - Custom model fine-tuning
   - Multi-language support
   - Image analysis for food photos

### Contributing

To add support for new report types:

1. Create analyzer in `src/lib/lab-analyzers/`
2. Add types to `src/lib/claude-client.ts`
3. Update `master-analyzer.ts` routing
4. Add database schema if needed
5. Update API endpoint handling

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review error logs in console
3. Test with sample PDFs
4. Verify environment configuration

The system is designed to be robust and self-healing, with comprehensive error handling and validation at every step. 