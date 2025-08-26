#!/bin/bash

echo "🧪 Creating test document for pipeline monitoring..."

# Create test document content
cat > test-lab-report.txt << 'EOF'
COMPREHENSIVE METABOLIC PANEL
Lab Results for: Test Patient
Date: $(date)

GLUCOSE: 105 mg/dL (Reference: 65-99 mg/dL)
BUN: 15 mg/dL (Reference: 7-20 mg/dL)  
CREATININE: 0.9 mg/dL (Reference: 0.7-1.3 mg/dL)
SODIUM: 141 mmol/L (Reference: 136-145 mmol/L)
POTASSIUM: 4.0 mmol/L (Reference: 3.5-5.1 mmol/L)
CHLORIDE: 103 mmol/L (Reference: 98-107 mmol/L)
CO2: 25 mmol/L (Reference: 22-28 mmol/L)

LIPID PANEL
TOTAL CHOLESTEROL: 210 mg/dL (Reference: <200 mg/dL)
HDL CHOLESTEROL: 42 mg/dL (Reference: >40 mg/dL)
LDL CHOLESTEROL: 135 mg/dL (Reference: <100 mg/dL)
TRIGLYCERIDES: 165 mg/dL (Reference: <150 mg/dL)

LIVER FUNCTION
ALT: 28 U/L (Reference: 7-56 U/L)
AST: 22 U/L (Reference: 10-40 U/L)

END OF REPORT
EOF

echo "📄 Test document created: test-lab-report.txt"
echo "🚀 Uploading document to trigger AI pipeline..."

# Upload the document using curl
RESPONSE=$(curl -s -X POST \
  -F "file=@test-lab-report.txt" \
  -F "clientId=test-client-123" \
  -F "documentType=lab_report" \
  -F "notes=Test document for pipeline monitoring" \
  http://localhost:3000/api/medical/upload)

echo "📋 Upload Response:"
echo "$RESPONSE" | jq '.'

# Extract document ID from response
DOCUMENT_ID=$(echo "$RESPONSE" | jq -r '.document.id // empty')

if [ -n "$DOCUMENT_ID" ]; then
  echo ""
  echo "✅ Document uploaded successfully!"
  echo "📋 Document ID: $DOCUMENT_ID"
  echo ""
  echo "🔬 Now you can monitor this document in the AI Pipeline Monitor!"
  echo ""
  echo "📖 Instructions:"
  echo "1. Open your browser to http://localhost:3000/dashboard/pipeline-monitor"
  echo "2. Enter this Document ID: $DOCUMENT_ID"
  echo "3. Click 'Start Monitoring' to watch the AI pipeline in real-time"
  echo ""
  echo "🎯 You should see:"
  echo "   ⏳ Stage 1: Document Structure Analysis (Prompt #1)"
  echo "   ⏳ Stage 2: AI-Powered Lab Extraction (Prompt #2)"
  echo "   ⏳ Stage 3: Functional Medicine Analysis (Prompt #3)"
  echo "   ⏳ Stage 4: Client Report Generation"
  echo ""
  echo "⚡ Processing typically takes 45-60 seconds total"
else
  echo "❌ Upload failed or document ID not found"
fi

# Clean up
rm -f test-lab-report.txt
