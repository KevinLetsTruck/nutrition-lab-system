# Assessment Simulator Guide

## Overview
The Assessment Simulator is an interactive tool that allows you to test different health scenarios and see how the AI analyzes symptoms and generates treatment protocols.

## Access the Tool
Navigate to: `http://localhost:3000/test/assessment-simulator`

## Features

### 1. Preset Personas
Choose from 4 pre-configured health profiles:
- **Hormone Imbalance**: Middle-aged woman with thyroid issues, fatigue, weight gain
- **Long COVID**: Post-COVID syndrome with multiple system involvement
- **Autoimmune**: Multiple autoimmune conditions with widespread inflammation
- **Metabolic Syndrome**: Diabetes, obesity, cardiovascular risk

### 2. Custom Configuration
- Adjust age and gender
- Use sliders to set severity (0-100%) for each body system
- See real-time severity badges:
  - 🟢 LOW (0-24%)
  - 🟡 MODERATE (25-49%)
  - 🟠 HIGH (50-74%)
  - 🔴 CRITICAL (75-100%)

### 3. Body Systems
All 10 systems can be adjusted:
- 🧠 Neurological
- 💧 Digestive
- ❤️ Cardiovascular
- 🫁 Respiratory
- 🛡️ Immune
- 💪 Musculoskeletal
- ⚡ Endocrine
- 🎨 Integumentary (Skin/Hair/Nails)
- 🩺 Genitourinary
- ⚠️ Special Topics

### 4. AI Analysis Generation
Click "Generate AI Analysis" to receive:
- Top 3 critical systems identification
- Root cause analysis with pattern recognition
- System-specific intervention protocols
- Phased implementation strategy
- Custom protocol additions (if specified)

### 5. Results Views
Three tabs for viewing results:
- **Analysis**: Full text report
- **Visual**: Bar chart showing system severities
- **Export**: Download options

### 6. Export Options
- Download as text file
- Copy to clipboard
- Export full data as JSON (includes all settings)

## Use Cases

### Testing Scenarios
1. Load a preset persona
2. Adjust specific systems to test edge cases
3. Generate analysis to see how AI responds
4. Tweak and regenerate to compare

### Custom Profiles
1. Set to "Custom Configuration"
2. Adjust each system based on actual patient data
3. Add custom protocol notes
4. Generate comprehensive analysis

### Protocol Development
1. Test which system combinations trigger specific root causes
2. See how different severities affect recommendations
3. Add custom protocols for unique cases
4. Export for documentation

## Example Workflow

1. **Select "Long COVID" preset**
   - Automatically loads typical post-COVID system scores
   - Shows high neurological, respiratory, and immune involvement

2. **Adjust severity levels**
   - Maybe reduce respiratory to 60% if breathing improved
   - Increase digestive to 70% if GI issues developed

3. **Add custom notes**
   - "Patient also reports new food sensitivities"
   - "Consider mast cell activation syndrome"

4. **Generate analysis**
   - See personalized protocol based on adjustments
   - Review root cause patterns identified

5. **Export results**
   - Save JSON for patient records
   - Copy text for clinical notes

## Tips

- Start with presets to understand typical patterns
- Small changes (5-10%) can affect which systems are prioritized
- The AI identifies patterns when multiple related systems are elevated
- Custom protocol additions appear at the end of the analysis
- Visual tab helps quickly identify the most affected systems

## Technical Notes

- All analysis is generated client-side (no API calls)
- Based on the same logic as the full assessment system
- Severity thresholds match the production assessment
- Export files include timestamp and all settings for reproducibility
