import ClaudeClient from './claude-client'
import { ReportData, AIAnalysis, SupplementRecommendation } from '@/components/reports/PractitionerAnalysis'

export async function generateAIAnalysis(reportData: ReportData): Promise<AIAnalysis> {
  try {
    const claudeClient = ClaudeClient.getInstance()
    
    // Prepare the comprehensive prompt with all client data
    const prompt = buildAnalysisPrompt(reportData)
    
    // Generate the AI analysis
    const response = await claudeClient.analyzePractitionerReport(
      prompt,
      buildSystemPrompt()
    )
    
    // Parse the response into structured data
    const analysis = parseAIAnalysisResponse(response, reportData)
    
    return analysis
  } catch (error) {
    console.error('Error generating AI analysis:', error)
    throw new Error(`Failed to generate AI analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function buildAnalysisPrompt(reportData: ReportData): string {
  const { client, nutriqData, labData, notes, protocols } = reportData
  
  let prompt = `Analyze this FNTP client data and create a practitioner-focused report:

CLIENT INFORMATION:
- Name: ${client.name}
- Occupation: ${client.occupation}
- Primary Health Concern: ${client.primaryHealthConcern}
- Truck Driver: ${client.truckDriver ? 'Yes' : 'No'}

NUTRIQ ASSESSMENT RESULTS:
- Total Score: ${nutriqData.totalScore}/60
- Assessment Date: ${nutriqData.assessmentDate}

Body System Scores:
${Object.entries(nutriqData.bodySystems).map(([system, data]) => 
  `- ${system}: ${data.score}/10 (Issues: ${data.issues.join(', ')})`
).join('\n')}

Overall Recommendations: ${nutriqData.overallRecommendations.join(', ')}
Priority Actions: ${nutriqData.priorityActions.join(', ')}

LAB RESULTS:
${labData.map(lab => 
  `- ${lab.reportType.toUpperCase()} (${lab.reportDate}): ${lab.status}
   Results: ${JSON.stringify(lab.results, null, 2)}
   Notes: ${lab.notes || 'None'}`
).join('\n\n')}

CLIENT NOTES:
${notes.map(note => 
  `- ${note.type} (${note.date}): ${note.content}`
).join('\n')}

PROTOCOLS:
${protocols.map(protocol => 
  `- ${protocol.phase} (${protocol.status}): Compliance ${protocol.compliance || 0}%
   Started: ${protocol.startDate}`
).join('\n')}

Please provide a comprehensive analysis including:

1. TOP 3 ROOT CAUSES with evidence from the data
2. SYSTEM INTERCONNECTIONS (gut-brain, HPA axis, etc.)
3. TRUCK DRIVER-SPECIFIC CONSIDERATIONS (if applicable)
4. PRIORITIZED INTERVENTION PROTOCOL with specific supplements:
   - Check Letstruck.com first for truck driver options
   - Then Biotics Research for professional grade
   - Then Fullscript for broader selection
   - Include dosage, timing, duration, and truck compatibility
5. EXPECTED TIMELINE for improvement
6. COMPLIANCE OPTIMIZATION STRATEGIES

Format the response as structured JSON with the following structure:
{
  "rootCauses": ["cause1", "cause2", "cause3"],
  "systemInterconnections": ["interconnection1", "interconnection2"],
  "truckDriverConsiderations": ["consideration1", "consideration2"],
  "interventionProtocol": {
    "immediate": {
      "supplements": [
        {
          "product": "Product Name",
          "source": "letstruck|biotics|fullscript",
          "dosage": "1 capsule",
          "timing": "with breakfast",
          "duration": "8 weeks",
          "truckCompatible": true,
          "notes": "Optional notes"
        }
      ],
      "dietary": ["dietary change 1", "dietary change 2"],
      "lifestyle": ["lifestyle change 1", "lifestyle change 2"]
    },
    "phased": {
      "week2_4": [supplement objects],
      "week4_8": [supplement objects]
    },
    "truckDriverMods": ["modification 1", "modification 2"]
  },
  "expectedTimeline": "Expected timeline description",
  "complianceStrategies": ["strategy 1", "strategy 2"]
}`

  return prompt
}

function buildSystemPrompt(): string {
  return `You are an expert FNTP (Functional Nutritional Therapy Practitioner) with deep knowledge of functional medicine, lab interpretation, and clinical protocols.

Your role is to analyze client data and provide comprehensive, actionable insights for practitioners during coaching calls.

Key principles:
1. Focus on root cause analysis rather than symptom management
2. Consider system interconnections (gut-brain axis, HPA axis, etc.)
3. Prioritize evidence-based interventions
4. Consider truck driver lifestyle constraints when applicable
5. Provide specific, actionable recommendations
6. Use professional-grade supplements when possible
7. Consider compliance and practical implementation

When recommending supplements:
- Prioritize Letstruck.com for truck drivers (algae-based omega-3, non-refrigerated options)
- Use Biotics Research for professional-grade formulations
- Use Fullscript for broader selection and competitive pricing
- Always specify dosage, timing, and duration
- Note truck compatibility for drivers

Provide clear, structured analysis that practitioners can use immediately in coaching sessions.`
}

function parseAIAnalysisResponse(response: string, reportData: ReportData): AIAnalysis {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate and transform the parsed data
    const analysis: AIAnalysis = {
      rootCauses: Array.isArray(parsed.rootCauses) ? parsed.rootCauses : [],
      systemInterconnections: Array.isArray(parsed.systemInterconnections) ? parsed.systemInterconnections : [],
      truckDriverConsiderations: Array.isArray(parsed.truckDriverConsiderations) ? parsed.truckDriverConsiderations : [],
      interventionProtocol: {
        immediate: {
          supplements: parseSupplements(parsed.interventionProtocol?.immediate?.supplements || []),
          dietary: Array.isArray(parsed.interventionProtocol?.immediate?.dietary) ? parsed.interventionProtocol.immediate.dietary : [],
          lifestyle: Array.isArray(parsed.interventionProtocol?.immediate?.lifestyle) ? parsed.interventionProtocol.immediate.lifestyle : []
        },
        phased: {
          week2_4: parseSupplements(parsed.interventionProtocol?.phased?.week2_4 || []),
          week4_8: parseSupplements(parsed.interventionProtocol?.phased?.week4_8 || [])
        },
        truckDriverMods: Array.isArray(parsed.interventionProtocol?.truckDriverMods) ? parsed.interventionProtocol.truckDriverMods : []
      },
      expectedTimeline: parsed.expectedTimeline || 'Timeline not specified',
      complianceStrategies: Array.isArray(parsed.complianceStrategies) ? parsed.complianceStrategies : [],
      generatedAt: new Date().toISOString()
    }
    
    return analysis
  } catch (error) {
    console.error('Error parsing AI analysis response:', error)
    
    // Return a fallback analysis if parsing fails
    return createFallbackAnalysis(reportData)
  }
}

function parseSupplements(supplements: any[]): SupplementRecommendation[] {
  return supplements.map(supp => ({
    product: supp.product || 'Unknown Product',
    source: ['letstruck', 'biotics', 'fullscript'].includes(supp.source) ? supp.source : 'fullscript',
    dosage: supp.dosage || 'As directed',
    timing: supp.timing || 'With meals',
    duration: supp.duration || '8 weeks',
    truckCompatible: supp.truckCompatible || false,
    notes: supp.notes || undefined
  }))
}

function createFallbackAnalysis(reportData: ReportData): AIAnalysis {
  const { client, nutriqData } = reportData
  
  // Create basic fallback analysis based on NutriQ scores
  const topSystems = Object.entries(nutriqData.bodySystems)
    .sort(([,a], [,b]) => b.score - a.score)
    .slice(0, 3)
    .map(([system]) => system)
  
  const rootCauses = [
    `High ${topSystems[0]} system dysfunction (${nutriqData.bodySystems[topSystems[0] as keyof typeof nutriqData.bodySystems].score}/10)`,
    `Systemic inflammation indicated by elevated scores across multiple systems`,
    `Lifestyle factors contributing to chronic stress and poor recovery`
  ]
  
  const systemInterconnections = [
    `Gut-brain axis dysfunction: High digestion (${nutriqData.bodySystems.digestion.score}/10) and mood (${nutriqData.bodySystems.mood.score}/10) scores`,
    `HPA axis dysregulation: Elevated stress (${nutriqData.bodySystems.stress.score}/10) and sleep (${nutriqData.bodySystems.sleep.score}/10) scores`,
    `Immune-inflammatory cascade affecting energy and overall function`
  ]
  
  const truckDriverConsiderations = client.truckDriver ? [
    'Irregular sleep patterns affecting HPA axis function',
    'Limited access to healthy food options',
    'Prolonged sitting contributing to metabolic dysfunction',
    'High stress environment requiring targeted stress management'
  ] : []
  
  const supplements: SupplementRecommendation[] = [
    {
      product: 'Biotics Research - Bio-D-Mulsion Forte',
      source: 'biotics',
      dosage: '1 drop daily',
      timing: 'with breakfast',
      duration: '8 weeks',
      truckCompatible: true,
      notes: 'Vitamin D support for immune function'
    },
    {
      product: 'Biotics Research - CytoFlora',
      source: 'biotics',
      dosage: '1 capsule twice daily',
      timing: '30 minutes before meals',
      duration: '8 weeks',
      truckCompatible: true,
      notes: 'Gut microbiome support'
    }
  ]
  
  return {
    rootCauses,
    systemInterconnections,
    truckDriverConsiderations,
    interventionProtocol: {
      immediate: {
        supplements,
        dietary: [
          'Eliminate processed foods and added sugars',
          'Increase protein intake to 1g per pound body weight',
          'Add 2-3 servings of vegetables per meal'
        ],
        lifestyle: [
          'Prioritize 7-8 hours of sleep per night',
          'Implement stress management techniques',
          'Begin gentle movement/exercise routine'
        ]
      },
      phased: {
        week2_4: [],
        week4_8: []
      },
      truckDriverMods: client.truckDriver ? [
        'Focus on non-refrigerated supplement options',
        'Schedule supplements around drive times',
        'Prepare meals in advance for truck stops'
      ] : []
    },
    expectedTimeline: 'Initial improvements in energy and digestion within 2-4 weeks. Full protocol benefits expected by 8-12 weeks.',
    complianceStrategies: [
      'Start with foundational protocols to build confidence',
      'Provide clear, simple instructions',
      'Schedule regular check-ins for accountability',
      'Focus on immediate, noticeable improvements'
    ],
    generatedAt: new Date().toISOString()
  }
} 