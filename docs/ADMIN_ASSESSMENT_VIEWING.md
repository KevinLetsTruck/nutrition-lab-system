# Admin Assessment Viewing Guide

## Overview
The admin assessment dashboard provides comprehensive viewing and analysis of all client health assessments.

## Accessing the Dashboard

### Navigation
1. Login as an admin user
2. Navigate to the main dashboard
3. Click on **"Assessments"** in the navigation bar
4. This takes you to `/dashboard/assessments`

### Dashboard Features

#### Assessment List View
- **Search**: Filter assessments by client name or email
- **Status Filters**: 
  - All
  - Completed (with full AI analysis)
  - In Progress
- **Table Columns**:
  - Client information
  - Assessment status
  - Current module
  - Questions asked/saved
  - Overall health score
  - Start/completion dates
  - Quick view action

#### Stats Overview
- Total assessments count
- Completed assessments
- In-progress assessments
- Average questions asked per assessment

## Individual Assessment View

Click on any assessment to view detailed results at `/dashboard/assessments/[id]`

### Client Information Section
- Full name and email
- Gender and age (if provided)
- Assessment dates and status

### Overall Health Score
- AI-generated score out of 100
- Color-coded indicator:
  - Green (80-100): Excellent health
  - Yellow (60-79): Good with some concerns
  - Orange (40-59): Moderate concerns
  - Red (0-39): Significant health issues
- AI summary of findings
- Questions asked vs. saved by AI

### Body System Analysis
Visual breakdown of all 10 body systems:
- Neurological System
- Digestive System
- Cardiovascular System
- Respiratory System
- Immune System
- Musculoskeletal System
- Endocrine System
- Integumentary System (Skin/Hair/Nails)
- Genitourinary System
- Special Topics (COVID, Seed Oils, etc.)

Each system shows:
- Progress bar visualization
- Numerical score out of 100
- Color-coded health status

### Key Insights

#### Primary Concerns (Red)
- Top health issues identified by AI
- Listed in order of severity
- Based on response patterns

#### Strengths (Green)
- Body systems functioning well
- Positive health indicators
- Areas of good health habits

### Laboratory Recommendations

#### Essential Tests
- Must-have diagnostic tests
- Based on symptom patterns
- Critical for diagnosis

#### Recommended Tests
- Additional helpful tests
- Provide deeper insights
- Support treatment planning

#### Optional Tests
- Nice-to-have diagnostics
- For comprehensive analysis
- Based on specific concerns

### Assessment Responses
- Toggle to show/hide all responses
- Complete question-answer pairs
- Response scores and timestamps
- Organized by body system

### Actions Available
- **View Client**: Navigate to full client profile
- **Generate Protocol**: Create treatment plan
- **Download Report**: Export PDF (coming soon)

## Best Practices

### For Reviewing Assessments
1. Start with overall score and AI summary
2. Review body system breakdown
3. Focus on primary concerns
4. Check lab recommendations
5. Review individual responses if needed

### For Client Communication
1. Use the AI summary as talking points
2. Highlight both concerns and strengths
3. Explain lab recommendations
4. Create action plan based on findings

## AI Analysis Features

### Automatic Generation
- Analysis generates on first view of completed assessment
- Cached for future views
- Based on all responses and patterns

### What AI Analyzes
- Response patterns across systems
- Severity scores and frequencies
- Cross-system relationships
- Risk factor identification
- Strength identification
- Lab test predictions

### Seed Oil Assessment
Special analysis for seed oil exposure:
- Exposure level (0-10)
- Damage indicators
- Recovery potential
- Priority level
- Specific recommendations

## Troubleshooting

### Assessment Not Loading
- Ensure client has completed assessment
- Check your admin permissions
- Refresh the page

### Missing Analysis
- Analysis generates on first view
- May take a few seconds
- Check for errors in console

### Filtering Issues
- Use the dropdown select menu
- Clear search to see all results
- Check status filter selection

## Future Features
- PDF report generation
- Email reports to clients
- Comparative analysis over time
- Treatment protocol integration
- Outcome tracking
