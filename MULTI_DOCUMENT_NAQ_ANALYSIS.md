# Multi-Document NAQ Analysis Feature

## Overview
This feature allows users to upload multiple NAQ/NutriQ assessment PDFs and generate a comprehensive analysis that combines insights across all documents. This is particularly useful for:
- Tracking health progression over time
- Identifying persistent vs emerging patterns
- Consolidating root causes across multiple assessments
- Prioritizing interventions based on frequency and severity

## New Components

### 1. API Endpoint: `/api/analyze-naq-multiple`
- Accepts multiple PDF files via multipart/form-data
- Processes each file individually using the enhanced NAQ analyzer
- Combines results into a comprehensive multi-document report
- Includes pattern frequency analysis, trend detection, and cross-report insights

### 2. Frontend Page: `/naq-multiple-demo`
- User-friendly interface for selecting multiple PDFs
- Real-time file management (add/remove files)
- Three-tab view: Combined Analysis, Visual Comparison, Individual Reports

### 3. Visualization Component: `MultiDocumentComparison`
- Symptom burden timeline charts
- Pattern frequency bar charts
- Average pattern confidence radar charts
- Progress tracking visualizations

## Key Features

### Combined Analysis
- **Aggregated Pattern Data**: Shows pattern confidence levels across all reports
- **Persistent Patterns**: Identifies patterns that appear in all reports
- **Emerging Patterns**: Highlights new patterns that appear in only one report
- **Consolidated Root Causes**: Analyzes root cause frequency across reports
- **Prioritized Interventions**: Groups interventions by priority level

### Visual Comparison
- **Timeline View**: Shows how patterns evolve across multiple assessments
- **Frequency Analysis**: Visualizes how often each pattern appears
- **Confidence Levels**: Displays average confidence for each pattern type
- **Progress Tracking**: Visual representation of improvement/decline

### Individual Reports
- Full comprehensive analysis for each uploaded document
- Side-by-side comparison capability
- Detailed functional medicine insights per report

## Usage

1. Navigate to `/naq-multiple-demo`
2. Enter client information (name, email)
3. Select multiple NAQ PDF files using the file picker
4. Click "Analyze X NAQ Reports"
5. View results in three different formats:
   - Combined Analysis tab for aggregated insights
   - Visual Comparison tab for charts and graphs
   - Individual Reports tab for detailed per-document analysis

## Technical Implementation

### Data Flow
1. Multiple PDFs uploaded to `/api/analyze-naq-multiple`
2. Each PDF processed through `NutriQAnalyzer` with document API
3. Individual comprehensive reports generated for each document
4. Results combined using aggregation functions:
   - `aggregateSymptomBurden`: Analyzes pattern confidence across reports
   - `identifyCrossReportPatterns`: Finds persistent/emerging patterns
   - `consolidateRootCauses`: Identifies common root causes
   - `prioritizeInterventions`: Groups interventions by priority

### Key Algorithms
- **Trend Calculation**: Compares first half vs second half averages
- **Pattern Deduplication**: Keeps highest confidence version of each pattern
- **Root Cause Frequency**: Counts occurrences across all pattern hierarchies
- **Intervention Prioritization**: Based on pattern intervention priorities

## API Example

```bash
curl -X POST http://localhost:3000/api/analyze-naq-multiple \
  -F "files=@/path/to/naq-report1.pdf" \
  -F "files=@/path/to/naq-report2.pdf" \
  -F "files=@/path/to/naq-report3.pdf" \
  -F "clientName=Carole Corkadel" \
  -F "clientEmail=carole@example.com"
```

## Benefits
1. **Longitudinal Analysis**: Track health changes over time
2. **Pattern Recognition**: Identify consistent vs transient issues
3. **Treatment Effectiveness**: See which interventions are working
4. **Comprehensive View**: Get a complete picture from multiple assessments
5. **Visual Insights**: Charts make trends easy to understand