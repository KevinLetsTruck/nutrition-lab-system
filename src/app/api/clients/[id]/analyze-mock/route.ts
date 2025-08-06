import { NextRequest, NextResponse } from 'next/server'
import { ClientDataAggregator } from '@/lib/analysis/client-data-aggregator'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const resolvedParams = await params
    const clientId = resolvedParams.id
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }
    
    // Aggregate all client data
    const aggregator = new ClientDataAggregator(supabase)
    const clientData = await aggregator.aggregateAllClientData(clientId)
    
    // Create a mock analysis without calling Claude
    const mockAnalysis = {
      id: crypto.randomUUID(),
      clientId,
      analysisDate: new Date().toISOString(),
      aiProvider: 'mock',
      clientProfile: clientData.clientProfile,
      
      rootCauseAnalysis: {
        primary: [
          {
            system: 'Digestive',
            issue: 'Gut dysbiosis and food sensitivities',
            confidence: 0.85,
            evidence: ['Positive Candida markers', 'Multiple food sensitivities on KBMO test']
          }
        ],
        secondary: [
          {
            system: 'Hormonal',
            issue: 'Female reproductive imbalance',
            confidence: 0.75,
            evidence: ['Elevated female reproductive score (12/12)']
          }
        ],
        contributing: ['Stress', 'Diet', 'Sleep quality']
      },
      
      systemsPriority: [
        { system: 'Digestive', priority: 1, rationale: 'Foundation for overall health' },
        { system: 'Hormonal', priority: 2, rationale: 'Significant symptoms reported' },
        { system: 'Immune', priority: 3, rationale: 'Secondary to gut health' }
      ],
      
      executiveSummary: 'Based on the available lab data and assessments, the primary focus should be on addressing gut health and food sensitivities. The positive Candida marker and multiple food reactions suggest gut dysbiosis that needs immediate attention.',
      
      supplementProtocol: {
        phase1: [
          {
            name: 'Gut Repair Protocol',
            supplement: 'L-Glutamine',
            dosage: '5g twice daily',
            timing: 'Morning and evening on empty stomach',
            duration: '8 weeks',
            source: 'Fullscript',
            notes: 'Essential for gut lining repair'
          },
          {
            name: 'Probiotic Support',
            supplement: 'Biotics BioDoph-7 Plus',
            dosage: '1 capsule twice daily',
            timing: 'With meals',
            duration: '12 weeks',
            source: 'Biotics Research',
            notes: 'Professional-grade multi-strain probiotic'
          }
        ],
        phase2: [],
        phase3: []
      },
      
      treatmentPhases: {
        repair: {
          duration: '8-12 weeks',
          focus: 'Gut healing and inflammation reduction',
          keyInterventions: ['Elimination diet', 'Gut repair supplements', 'Stress management']
        },
        restore: {
          duration: '12-16 weeks',
          focus: 'Microbiome restoration',
          keyInterventions: ['Probiotic therapy', 'Prebiotic foods', 'Continued diet modification']
        },
        maintain: {
          duration: 'Ongoing',
          focus: 'Long-term health optimization',
          keyInterventions: ['Maintenance supplements', 'Regular monitoring', 'Lifestyle integration']
        }
      },
      
      lifestyleIntegration: {
        nutrition: ['Avoid identified food sensitivities', 'Anti-inflammatory diet', 'Increase fiber intake'],
        movement: ['Daily walking', 'Yoga for stress reduction'],
        sleep: ['7-9 hours nightly', 'Consistent sleep schedule'],
        stress: ['Meditation practice', 'Deep breathing exercises']
      },
      
      monitoringPlan: {
        immediate: ['Weekly symptom tracking'],
        shortTerm: ['Retest food sensitivities in 3 months'],
        longTerm: ['Annual comprehensive lab panel']
      },
      
      expectedOutcomes: {
        week4: ['Reduced digestive symptoms', 'Improved energy'],
        week8: ['Better food tolerance', 'Hormonal balance improvement'],
        week12: ['Sustained improvements', 'Overall wellbeing enhancement']
      }
    }
    
    const artifacts = {
      executiveSummary: {
        title: 'Executive Health Summary',
        content: mockAnalysis.executiveSummary,
        format: 'pdf',
        priority: 1
      },
      detailedReport: {
        title: 'Comprehensive Analysis Report',
        content: JSON.stringify(mockAnalysis, null, 2),
        format: 'pdf',
        priority: 2
      },
      supplementProtocol: {
        title: 'Personalized Supplement Protocol',
        content: JSON.stringify(mockAnalysis.supplementProtocol, null, 2),
        format: 'pdf',
        priority: 3
      }
    }
    
    return NextResponse.json({
      success: true,
      analysis: mockAnalysis,
      artifacts,
      supplementRecommendations: mockAnalysis.supplementProtocol,
      message: 'Analysis completed (using mock data due to API key issue)',
      warning: 'This is a mock analysis. For AI-powered analysis, ensure ANTHROPIC_API_KEY is properly configured.'
    })
    
  } catch (error) {
    console.error('Mock analysis failed:', error)
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}