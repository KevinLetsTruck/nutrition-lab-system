/**
 * Claude Desktop Prompt Generator
 * 
 * Generates intelligent, customized Claude Desktop prompts for functional medicine analysis
 * based on each client's specific data availability and health context.
 */

interface ClientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  status: string;
  healthGoals: any;
  conditions: any;
  medications: any;
  gender?: string;
}

interface Document {
  fileName: string;
  originalFileName?: string;
  documentType?: string;
  labType?: string;
  fileType: string;
  uploadedAt: string;
}

interface Assessment {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  responses: Array<{
    id: string;
    responseValue: number;
    questionText?: string;
  }>;
}

interface Protocol {
  id: string;
  protocolName: string;
  status: string;
  createdAt: string;
  supplements?: any;
  dietary?: any;
  lifestyle?: any;
}

export function generateClaudeDesktopPrompt(
  client: ClientData,
  documents: Document[],
  assessments: Assessment[],
  protocols: Protocol[],
  notes: any[]
): string {
  const documentList = generateDocumentInventoryForPrompt(documents);
  const assessmentContext = generateAssessmentContextForPrompt(assessments);
  const protocolHistory = generateProtocolHistoryForPrompt(protocols);
  const clinicalNotesContext = generateClinicalNotesContext(notes);
  const clientAge = client.dateOfBirth ? calculateAge(client.dateOfBirth) : null;

  return `# FUNCTIONAL MEDICINE ANALYSIS PROMPT - ${client.firstName} ${client.lastName}

## CLIENT CONTEXT
**Name**: ${client.firstName} ${client.lastName}  
**Age**: ${clientAge ? `${clientAge} years old` : 'Age not specified'}  
**Gender**: ${client.gender || 'Not specified'}  
**Status**: ${client.status}  
**Analysis Date**: ${new Date().toLocaleDateString()}  
**Export Package**: Comprehensive functional medicine data package  

${generateHealthGoalsContext(client)}

## PACKAGE CONTENTS ANALYSIS
This ZIP package contains the following data sources for your comprehensive analysis:

### 📊 Structured Analysis Files
- \`client-data.json\` - Complete structured client information for cross-referencing
- \`client-summary.md\` - Human-readable client overview and health timeline
- \`functional-assessment-analysis.md\` - Functional medicine assessment analysis with patterns
- \`export-metadata.json\` - Export information and data completeness metrics
- \`CLAUDE-DESKTOP-PROMPT.md\` - This optimal analysis prompt (you're reading it now)

### 📄 Raw Documents for Direct Analysis
${documentList}

### 📋 Assessment Data Context
${assessmentContext}

${protocolHistory ? `### 📈 Previous Protocol History
${protocolHistory}` : ''}

${clinicalNotesContext ? `### 📝 Clinical Notes Available
${clinicalNotesContext}` : ''}

---

## 🎯 FUNCTIONAL MEDICINE ANALYSIS FRAMEWORK

You are an expert functional medicine practitioner analyzing this complete client package. Apply evidence-based functional medicine principles for comprehensive root-cause analysis.

### 🔬 **CORE ANALYSIS PRINCIPLES**

#### **1. SYSTEMATIC ROOT CAUSE ANALYSIS**
- **Foundational Systems First**: Prioritize gut health, liver detoxification, HPA axis, thyroid function
- **Interconnected Patterns**: Map how dysfunction in one system cascades to others
- **Timeline Correlation**: Connect symptom onset with life events, stressors, toxic exposures
- **Functional Medicine Ranges**: Use optimal ranges (not just standard lab reference ranges)
- **Modern Insights**: Consider seed oil toxicity, EMF sensitivity, mold exposure, microplastic burden

#### **2. EVIDENCE INTEGRATION APPROACH**
- **Cross-Reference Everything**: Correlate assessment symptoms with lab values and document findings
- **Pattern Recognition**: Identify classic FM patterns (SIBO, adrenal fatigue, thyroid conversion issues, methylation dysfunction)
- **Missing Data Identification**: Note what additional testing would provide critical insights
- **Severity Assessment**: Distinguish between primary drivers and secondary compensatory symptoms

#### **3. INTERVENTION PRIORITIZATION STRATEGY**
- **Phase 1 Focus** (0-4 weeks): Address most critical imbalances affecting multiple systems
- **Phase 2 Planning** (4-12 weeks): Build on Phase 1 foundation with targeted system support
- **Long-term Strategy**: Maintenance and optimization protocols for sustained health

### 🎯 **SPECIFIC ANALYSIS INSTRUCTIONS**

#### **Document Review Priority Order**:
1. **Read \`client-summary.md\` FIRST** for complete health context and timeline
2. **Review \`functional-assessment-analysis.md\`** for symptom patterns and functional insights
3. **Analyze uploaded documents** (labs, NutriQ, NAQ) for specific biomarker data
4. **Cross-reference \`client-data.json\`** for structured data verification

#### **Functional Medicine Assessment Approach**:
- **NutriQ Documents**: Focus on symptom burden patterns and system-based dysfunction
- **NAQ Questionnaires**: Extract specific symptom clusters and severity patterns
- **Lab Results**: Apply functional medicine optimal ranges and interpret subclinical findings
- **Assessment Responses**: Look for functional medicine diagnostic patterns

#### **Clinical Decision-Making Framework**:
- **Address Root Causes**: Focus on WHY symptoms occur, not just symptom management
- **System Interconnections**: Map how imbalances in one area affect others
- **Compliance Considerations**: Factor in realistic implementation challenges
- **Monitoring Strategy**: Include objective markers for tracking protocol effectiveness

---

## 📋 **REQUIRED OUTPUT FORMAT**

**CRITICAL**: Structure your complete analysis as valid JSON for seamless FNTP system import:

\`\`\`json
{
  "analysisDate": "${new Date().toISOString().split('T')[0]}",
  "clientSummary": "2-3 sentence overview of primary health challenges and overall health trajectory based on all available data",
  "rootCauseAnalysis": "Detailed analysis of underlying systemic imbalances and their interconnections. Focus on WHY symptoms are occurring using functional medicine principles. Reference specific findings from uploaded documents.",
  
  "systemPriorities": [
    "Primary system requiring immediate intervention (e.g., 'Gut Health & Microbiome Restoration')",
    "Secondary system for concurrent support (e.g., 'HPA Axis & Stress Response')", 
    "Third priority system for Phase 2 (e.g., 'Thyroid Optimization & Conversion')"
  ],
  
  "phase1Protocol": {
    "duration": "4-6 weeks",
    "supplements": [
      {
        "name": "Specific supplement name (e.g., 'Digestive Enzymes with Betaine HCl')",
        "dosage": "Exact dosage with units (e.g., '1 capsule')",
        "timing": "When to take (e.g., 'with each meal', 'morning on empty stomach')",
        "duration": "How long to continue (e.g., '4-6 weeks initially')",
        "notes": "Important considerations, contraindications, or monitoring requirements"
      }
    ],
    "dietaryChanges": [
      "Specific dietary modification with clear rationale (e.g., 'Eliminate gluten for 30 days to assess inflammatory response')",
      "Another concrete dietary change with implementation guidance"
    ],
    "lifestyleModifications": [
      "Specific lifestyle change with practical implementation steps",
      "Another evidence-based modification with measurable outcomes"
    ]
  },
  
  "phase2Protocol": {
    "duration": "8-12 weeks", 
    "supplements": [
      {
        "name": "Advanced supplement for building on Phase 1",
        "dosage": "Specific dosage based on Phase 1 response",
        "timing": "Optimal timing for enhanced effectiveness",
        "duration": "Duration based on expected response timeline",
        "notes": "Advanced clinical considerations and monitoring"
      }
    ],
    "additionalInterventions": [
      "Advanced therapeutic intervention building on Phase 1 foundation",
      "Additional targeted support strategy for system optimization"
    ]
  },
  
  "monitoringPlan": {
    "keyBiomarkers": [
      "Specific lab test to recheck (e.g., 'CRP', 'Vitamin D 25-OH', 'TSH/Free T3')",
      "Another important biomarker for tracking protocol effectiveness"
    ],
    "retestingSchedule": "8-12 weeks after protocol initiation",
    "progressIndicators": [
      "Specific symptom improvement to expect (e.g., 'Improved morning energy within 2-3 weeks')",
      "Another measurable progress marker with timeline"
    ],
    "warningSignsToWatch": [
      "Specific warning sign requiring immediate practitioner contact",
      "Another concerning symptom that warrants protocol modification"
    ]
  },
  
  "practitionerNotes": "Additional clinical insights, contraindications, drug interactions, or implementation considerations for the healthcare provider. Include any concerns about compliance, cost, or complexity."
}
\`\`\`

## 🔬 **FUNCTIONAL MEDICINE ANALYSIS REQUIREMENTS**

### **Lab Value Interpretation**
- **Use Functional Medicine Optimal Ranges**: Not just standard reference ranges
- **Examples**: TSH optimal 0.5-2.0 (not 0.4-4.0), CRP <1.0 (not <3.0), Vitamin D 50-80 ng/mL (not 20-50)
- **Pattern Recognition**: Look for subclinical dysfunction patterns
- **System Integration**: Connect lab findings to symptoms and assessment data

### **Assessment Pattern Analysis**
- **Symptom Clustering**: Identify functional medicine diagnostic patterns
- **System Prioritization**: Focus on foundational systems affecting multiple areas
- **Severity Assessment**: Distinguish primary drivers from secondary symptoms
- **Timeline Analysis**: Connect symptom patterns to life events and stressors

### **Protocol Development Principles**
- **Start Simple**: Phase 1 should have maximum 4-5 supplements for compliance
- **Build Systematically**: Each phase builds on previous success
- **Monitor Objectively**: Include both subjective and objective progress markers
- **Consider Practicality**: Factor in cost, complexity, and lifestyle constraints

---

## ✅ **SUCCESS CRITERIA FOR YOUR ANALYSIS**

Your comprehensive analysis should deliver:

1. **Clear Root Cause Identification**: 1-2 primary systemic imbalances driving symptoms
2. **Evidence-Based Protocol**: Specific supplements with exact dosages and timing
3. **Realistic Implementation**: Manageable dietary and lifestyle recommendations
4. **Comprehensive Monitoring**: Both subjective progress and objective biomarker tracking
5. **JSON Format**: Structured output ready for direct FNTP system import
6. **Clinical Safety**: Include contraindications, warnings, and monitoring requirements

**Ready to begin comprehensive functional medicine analysis using all provided data sources.**

---

## 🎯 **ANALYSIS WORKFLOW**

1. **Review structured files first** (\`client-summary.md\`, \`functional-assessment-analysis.md\`)
2. **Analyze raw documents** for specific data points and biomarkers
3. **Cross-reference findings** between all data sources
4. **Apply functional medicine framework** for root cause identification
5. **Generate evidence-based protocol** with specific, actionable recommendations
6. **Structure output as JSON** for seamless system integration

**Begin analysis now - this client's health transformation awaits your expertise.**`;
}

function generateDocumentInventoryForPrompt(documents: Document[]): string {
  if (!documents.length) {
    return '  - No additional documents uploaded - analysis will rely on structured assessment data';
  }
  
  const organizedDocs = documents.map(doc => {
    const docType = identifyDocumentTypeForPrompt(doc.fileName, doc.documentType, doc.labType);
    const uploadDate = new Date(doc.uploadedAt).toLocaleDateString();
    return `  - **\`${doc.originalFileName || doc.fileName}\`** - ${docType} (uploaded ${uploadDate})`;
  }).join('\n');

  return `${organizedDocs}

**Analysis Priority**: Review structured assessment files first, then analyze these raw documents for specific biomarker data and clinical insights.`;
}

function identifyDocumentTypeForPrompt(filename: string, documentType?: string, labType?: string): string {
  const lowerFilename = filename.toLowerCase();
  
  // Specific document type identification for better prompt context
  if (lowerFilename.includes('nutriq') || lowerFilename.includes('nutri-q')) {
    if (lowerFilename.includes('bar') || lowerFilename.includes('graph')) {
      return 'NutriQ symptom burden visualization - analyze patterns and severity distribution';
    }
    if (lowerFilename.includes('report') || lowerFilename.includes('summary')) {
      return 'NutriQ functional medicine assessment report - comprehensive symptom analysis';
    }
    return 'NutriQ functional medicine assessment - extract symptom patterns and system dysfunction';
  }
  
  if (lowerFilename.includes('naq')) {
    return 'NAQ (Nutritional Assessment Questionnaire) - 295-question functional medicine evaluation';
  }
  
  if (lowerFilename.includes('lab') || lowerFilename.includes('blood') || lowerFilename.includes('test')) {
    const labContext = labType ? ` (${labType})` : '';
    return `Laboratory results${labContext} - apply functional medicine optimal ranges for analysis`;
  }
  
  if (lowerFilename.includes('fit') || lowerFilename.includes('fitness')) {
    return 'Fitness assessment results - correlate physical capacity with health metrics';
  }
  
  if (lowerFilename.includes('intake') || lowerFilename.includes('form')) {
    return 'Client intake form - baseline health history and initial assessment';
  }
  
  if (documentType) {
    return `${documentType} document - analyze for relevant clinical insights`;
  }
  
  return 'Medical document - review for clinical relevance and biomarker data';
}

function generateAssessmentContextForPrompt(assessments: Assessment[]): string {
  if (!assessments.length) {
    return `- **No structured assessments completed** - Analysis will rely on uploaded documents
- **Recommendation**: Review NutriQ and NAQ documents for symptom data if available`;
  }
  
  const latestAssessment = assessments[0];
  const responseCount = latestAssessment.responses?.length || 0;
  const completionStatus = latestAssessment.status === 'completed' ? 'Complete' : 'In Progress';
  const completionDate = latestAssessment.completedAt 
    ? new Date(latestAssessment.completedAt).toLocaleDateString()
    : 'Ongoing';

  // Calculate average score for assessment context
  const validResponses = latestAssessment.responses.filter(r => r.responseValue > 0);
  const averageScore = validResponses.length > 0 
    ? (validResponses.reduce((sum, r) => sum + r.responseValue, 0) / validResponses.length).toFixed(1)
    : 'N/A';

  return `- **Latest Assessment**: ${completionDate} (${completionStatus})
- **Response Coverage**: ${responseCount} questions answered across functional medicine systems
- **Symptom Severity**: Average score ${averageScore}/5 (higher = more symptomatic)
- **Analysis Approach**: Use structured symptom data for pattern recognition and system prioritization
- **Data Quality**: High-quality functional medicine assessment with severity ratings`;
}

function generateProtocolHistoryForPrompt(protocols: Protocol[]): string | null {
  if (!protocols.length) {
    return null;
  }
  
  const activeProtocols = protocols.filter(p => p.status === 'active').length;
  const completedProtocols = protocols.filter(p => p.status === 'completed').length;
  const totalProtocols = protocols.length;

  return `- **Protocol History**: ${totalProtocols} previous protocols (${activeProtocols} active, ${completedProtocols} completed)
- **Historical Analysis**: Review past intervention effectiveness and compliance patterns
- **Protocol Evolution**: Build on successful interventions, avoid repeated ineffective approaches
- **Implementation Insights**: Consider what has/hasn't worked for this client previously`;
}

function generateClinicalNotesContext(notes: any[]): string | null {
  if (!notes.length) {
    return null;
  }

  const interviewNotes = notes.filter(n => n.noteType === 'INTERVIEW').length;
  const coachingNotes = notes.filter(n => n.noteType === 'COACHING').length;
  const recentNotes = notes.slice(0, 3);

  return `- **Clinical Notes**: ${interviewNotes} interview notes, ${coachingNotes} coaching session notes
- **Recent Activity**: ${recentNotes.length} recent clinical interactions for timeline context
- **Clinical Insights**: Practitioner observations, chief complaints, and treatment responses
- **Timeline Context**: Historical progression and practitioner assessment patterns`;
}

function generateHealthGoalsContext(client: ClientData): string {
  let healthContext = '';

  if (client.healthGoals) {
    const goals = Array.isArray(client.healthGoals) 
      ? client.healthGoals 
      : typeof client.healthGoals === 'string'
        ? client.healthGoals.split(',').map(g => g.trim())
        : [client.healthGoals];
    
    if (goals.length > 0) {
      healthContext += `**Health Goals**: ${goals.filter(g => g).join(', ')}\n`;
    }
  }

  if (client.conditions) {
    const conditions = Array.isArray(client.conditions) 
      ? client.conditions 
      : typeof client.conditions === 'string'
        ? client.conditions.split(',').map(c => c.trim())
        : [client.conditions];
    
    if (conditions.length > 0) {
      healthContext += `**Known Conditions**: ${conditions.filter(c => c).join(', ')}\n`;
    }
  }

  if (client.medications) {
    const medications = Array.isArray(client.medications) 
      ? client.medications 
      : typeof client.medications === 'string'
        ? client.medications.split(',').map(m => m.trim())
        : [client.medications];
    
    if (medications.length > 0) {
      healthContext += `**Current Medications**: ${medications.filter(m => m).join(', ')}\n`;
    }
  }

  return healthContext ? `${healthContext}\n` : '';
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
