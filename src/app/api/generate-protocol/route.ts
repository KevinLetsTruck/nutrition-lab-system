import { NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json()
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    // Gather ALL client data
    const clientData = await gatherAllClientData(clientId)
    
    // Create comprehensive summary for Claude
    const prompt = `
You are Kevin Rutherford, FNTP specializing in truck driver health.

Analyze all client information and create:
1. Coaching call summary notes
2. A protocol following the EXACT format below

CLIENT DATA:
${JSON.stringify(clientData, null, 2)}

PROTOCOL FORMAT:
GREETING
[Personalized greeting using client's name]

PHASE # & NAME OF PROTOCOL
[e.g., "PHASE 1: GUT RESTORATION & INFLAMMATION REDUCTION"]

DURATION: [X weeks]
CLINICAL FOCUS: [Primary health targets]
CURRENT STATUS: [Summary of client's current state]

PRIORITY SUPPLEMENTS
[For each supplement:]
NAME OF PRODUCT: [Exact product name from letstruck.com, Biotics, or Fullscript]
DOSE: [Specific dosage]
TIMING: [When to take]
PURPOSE: [Why this supplement]

DAILY PROTOCOL SCHEDULE
UPON WAKING: [Supplements/actions]
BEFORE BREAKFAST: [Supplements/actions]
BETWEEN BREAKFAST & LUNCH: [Supplements/actions]
BEFORE LUNCH: [Supplements/actions]
WITH LARGEST MEAL: [Supplements/actions]
BETWEEN LUNCH & DINNER: [Supplements/actions]

PROTOCOL NOTES
[Important considerations, truck driver lifestyle modifications, warnings]
`

    // For now, return a mock protocol since the Claude client method is private
    // TODO: Add a public method to ClaudeClient for protocol generation
    const analysis = `GREETING
Hello ${clientData.demographics?.name || 'Client'},

Thank you for completing your comprehensive health assessment. Based on your lab results and our consultation, I've created a personalized protocol to address your health goals.

PHASE 1: GUT RESTORATION & INFLAMMATION REDUCTION

DURATION: 8 weeks
CLINICAL FOCUS: Reduce inflammation, improve gut health, increase energy levels
CURRENT STATUS: Based on your assessment data, we'll focus on foundational health improvements

PRIORITY SUPPLEMENTS

NAME OF PRODUCT: Biotics Research - Bio-D-Mulsion Forte
DOSE: 1 drop daily
TIMING: With breakfast
PURPOSE: Optimize vitamin D levels for immune function and inflammation reduction

NAME OF PRODUCT: Biotics Research - CytoFlora
DOSE: 1 capsule twice daily
TIMING: 30 minutes before meals
PURPOSE: Support healthy gut microbiome and reduce inflammation

NAME OF PRODUCT: Biotics Research - Magnesium Glycinate
DOSE: 200mg twice daily
TIMING: With meals
PURPOSE: Support muscle function and energy production

DAILY PROTOCOL SCHEDULE

UPON WAKING: 16oz water with lemon, 1 drop Bio-D-Mulsion Forte
BEFORE BREAKFAST: 1 CytoFlora capsule
BETWEEN BREAKFAST & LUNCH: 200mg Magnesium Glycinate
BEFORE LUNCH: 1 CytoFlora capsule
WITH LARGEST MEAL: 200mg Magnesium Glycinate
BETWEEN LUNCH & DINNER: Hydration focus, herbal tea

PROTOCOL NOTES

• Focus on whole foods, avoiding processed foods and added sugars
• Prioritize sleep hygiene - aim for 7-8 hours per night
• Consider meal prep strategies for truck stops
• Monitor energy levels and digestive symptoms
• Schedule follow-up in 4 weeks to assess progress
• Continue any current medications as prescribed`
    
    // Save protocol to database
    const protocol = await saveProtocol(clientId, analysis)
    
    return NextResponse.json({ 
      protocolId: protocol.id,
      content: analysis 
    })
    
  } catch (error) {
    console.error('Protocol generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate protocol' }, 
      { status: 500 }
    )
  }
}

async function gatherAllClientData(clientId: string) {
  // TODO: Implement actual data gathering from database
  // For now, returning mock data structure
  
  return {
    demographics: {
      name: 'John Smith',
      age: 45,
      occupation: 'Truck Driver',
      routeType: 'OTR'
    },
    allNotes: [
      {
        type: 'Interview',
        content: 'Initial consultation - reports fatigue, digestive issues, difficulty maintaining healthy eating on the road',
        date: '2024-01-15'
      }
    ],
    uploadedDocuments: [
      {
        name: 'NutriQ Lab Results',
        type: 'Lab Report',
        content: 'Mock lab data showing inflammation markers elevated'
      }
    ],
    labAnalyses: {
      inflammation: 'Elevated',
      gutHealth: 'Compromised',
      energyMarkers: 'Low'
    },
    intakeAssessment: {
      primaryGoals: 'Increase energy, improve digestion',
      currentSupplements: 'Multivitamin, fish oil',
      medications: 'Blood pressure medication'
    },
    notesSummary: 'Client is a 45-year-old OTR truck driver experiencing fatigue and digestive issues. Struggles with healthy eating on the road.',
    healthPriorities: ['Reduce inflammation', 'Improve gut health', 'Increase energy levels']
  }
}

async function saveProtocol(clientId: string, content: string) {
  // TODO: Implement database save
  // For now, returning mock protocol object
  
  return {
    id: `protocol_${Date.now()}`,
    clientId,
    content,
    createdAt: new Date().toISOString()
  }
} 