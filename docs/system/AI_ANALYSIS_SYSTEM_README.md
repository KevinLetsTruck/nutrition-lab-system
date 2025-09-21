# FNTP AI Analysis System Documentation

## 🚀 Overview

The FNTP AI Analysis System provides automated functional medicine analysis for client data using Claude Sonnet 4 AI. It builds on the proven export system foundation to aggregate comprehensive client data and generate expert-level functional medicine recommendations.

## 📋 Features

### **Comprehensive Data Integration**
- ✅ **Client Demographics**: Personal info, health goals, conditions, medications, allergies
- ✅ **Assessment Analysis**: 80-question assessment responses with scoring analytics
- ✅ **Document & Lab Analysis**: AI analysis of uploaded documents and lab results
- ✅ **Clinical Notes**: Practitioner session notes and observations
- ✅ **Treatment Protocols**: Current supplements, dietary, and lifestyle protocols

### **AI Analysis Capabilities**
- **Pattern Recognition**: Identifies connections across symptoms and assessments
- **Root Cause Analysis**: Uses functional medicine principles for deeper insights
- **Prioritized Recommendations**: Targeted interventions ranked by impact and urgency
- **Clinical Integration**: Incorporates practitioner notes and treatment history

### **Smart Caching System**
- **24-Hour Cache**: Avoids unnecessary API calls for recent analyses
- **Version Tracking**: Tracks analysis version for future improvements
- **Database Storage**: Persists results for historical reference

---

## 🎯 Usage

### **API Endpoint**
**POST** `/api/clients/[clientId]/ai-analysis`

**Authentication**: Bearer token required

**Request Example**:
```bash
curl -X POST \
  https://your-domain.com/api/clients/[clientId]/ai-analysis \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "analysis": "# Functional Medicine Analysis for [Client Name]...",
    "analysisDate": "2025-01-26T10:30:00.000Z",
    "cached": false,
    "clientName": "John Doe",
    "summary": {
      "totalAssessments": 2,
      "totalDocuments": 5,
      "totalNotes": 3,
      "totalProtocols": 1
    }
  }
}
```

**Cached Response** (if analysis < 24 hours old):
```json
{
  "success": true,
  "data": {
    "analysis": "# Functional Medicine Analysis for [Client Name]...",
    "analysisDate": "2025-01-26T08:15:00.000Z",
    "cached": true,
    "clientName": "John Doe"
  }
}
```

**Error Response**:
```json
{
  "error": "Client not found",
  "details": "No client exists with the provided ID"
}
```

---

## 🔧 Technical Implementation

### **Database Schema Extension**
Added to Client table:
```sql
aiAnalysisResults    String?    -- Markdown analysis from Claude
aiAnalysisDate       DateTime?  -- Timestamp of analysis
aiAnalysisVersion    String?    -- Version tracking (default: 'v1.0')
```

### **Data Aggregation**
Reuses proven export system query:
- Single Prisma query with comprehensive includes
- All 5 main tables: Client, SimpleAssessment, Document, Note, Protocol
- Related data: DocumentAnalysis, LabValue, SimpleResponse

### **Claude AI Integration**
- **Model**: Claude 3 Sonnet (claude-3-sonnet-20240229)
- **Max Tokens**: 4,000
- **Temperature**: 0.3 (focused, consistent responses)
- **Prompt**: Comprehensive functional medicine analysis template

### **Analysis Structure**
The AI provides structured markdown analysis covering:

1. **Comprehensive Health Assessment**
   - Overall health status and key concerns
   - Pattern recognition across symptoms
   - Root cause analysis

2. **Assessment Analysis** 
   - Score patterns and dysfunction indicators
   - Connections to potential root causes

3. **Document & Lab Insights**
   - Critical values and patterns
   - Correlation with assessment findings

4. **Functional Medicine Recommendations**
   - Targeted interventions (supplements, lifestyle, testing)
   - Prioritized by impact and urgency
   - Monitoring and follow-up suggestions

5. **Clinical Notes Integration**
   - Practitioner observations
   - Treatment history and responses

---

## ⚙️ Configuration

### **Required Environment Variables**
```env
# Claude AI API Configuration
ANTHROPIC_API_KEY="your-claude-api-key-here"

# Existing variables (from export system)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
S3_REGION="us-west-2"
S3_MEDICAL_BUCKET_NAME="fntp-medical-documents"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
```

### **Claude API Key Setup**
1. Sign up at https://console.anthropic.com/
2. Generate API key
3. Add to `.env.local` (development) or environment variables (production)

---

## 🔒 Security & Performance

### **Security Features**
- JWT authentication required
- User-specific data filtering
- API key stored in environment variables
- Input validation and sanitization
- Structured error responses (no sensitive data exposure)

### **Performance Optimizations**
- 24-hour caching reduces API calls
- Single database query for all data
- Efficient data transformation
- Memory-conscious processing

### **Rate Limiting Considerations**
- Claude API has rate limits
- Caching prevents unnecessary calls
- Error handling for API failures

---

## 🚨 Error Handling

### **Common Error Scenarios**

**Authentication Failure (401)**
```json
{ "error": "Unauthorized" }
```

**Client Not Found (404)**
```json
{ "error": "Client not found" }
```

**Claude API Error (500)**
```json
{
  "error": "Claude API error: 429 - Rate limit exceeded",
  "details": "Stack trace..."
}
```

**Missing API Key (500)**
```json
{
  "error": "Claude API key not configured",
  "details": "Environment variable ANTHROPIC_API_KEY not found"
}
```

---

## 🧪 Testing

### **Test with Existing Clients**

**John Doe** - Basic assessment data:
```bash
curl -X POST https://localhost:3000/api/clients/[john-doe-id]/ai-analysis \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Rich Data Client** - Full assessment + documents:
```bash
curl -X POST https://localhost:3000/api/clients/[rich-client-id]/ai-analysis \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Testing Checklist**
- [ ] Authentication with valid JWT token
- [ ] Client data aggregation
- [ ] Claude API integration
- [ ] Analysis storage in database
- [ ] 24-hour caching behavior
- [ ] Error handling (404, 401, 500)
- [ ] Response format consistency

---

## 🚀 Next Phase Integration

### **UI Integration Points**
Ready for Phase 1 automation UI:
- Add "Get AI Analysis" button to client detail page
- Display analysis results in modal or dedicated page
- Show loading states during API calls
- Handle errors with toast notifications

### **Suggested Button Implementation**
```typescript
// Similar to ExportClientButton pattern
<Button 
  onClick={handleAIAnalysis}
  disabled={isAnalyzing}
  variant="default"
  size="sm"
>
  {isAnalyzing ? <Loader2 className="animate-spin" /> : <Brain />}
  {isAnalyzing ? "Analyzing..." : "Get AI Analysis"}
</Button>
```

---

## 📈 Future Enhancements

### **Planned Features**
- [ ] Analysis comparison over time
- [ ] Custom analysis prompts per practitioner
- [ ] PDF export of analysis results
- [ ] Integration with treatment protocol generation
- [ ] Analysis history and versioning
- [ ] Batch analysis for multiple clients

### **AI Model Improvements**
- [ ] Fine-tuning with functional medicine datasets
- [ ] Specialized prompts for different client types
- [ ] Integration with lab reference databases
- [ ] Predictive health modeling

---

## 📞 Support

### **Troubleshooting**
1. Verify ANTHROPIC_API_KEY is configured
2. Check JWT token validity
3. Confirm client exists in database
4. Review Claude API rate limits
5. Check browser network console for errors

### **Debug Mode**
Enable verbose logging by checking browser console during analysis. All errors include detailed stack traces.

---

*Last Updated: January 26, 2025*  
*Version: 1.0.0*  
*System: FNTP Assessment & Analysis Platform*  
*AI Provider: Claude 3 Sonnet (Anthropic)*
