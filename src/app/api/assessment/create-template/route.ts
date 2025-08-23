import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check if default template exists
    let template = await prisma.assessmentTemplate.findFirst({
      where: { id: 'default' }
    });

    if (!template) {
      // Create default template
      template = await prisma.assessmentTemplate.create({
        data: {
          id: 'default',
          name: 'Comprehensive Functional Medicine Assessment',
          version: '1.0',
          questionBank: {
            totalQuestions: 495,
            modules: [
              'SCREENING',
              'ASSIMILATION', 
              'DEFENSE_REPAIR',
              'ENERGY',
              'BIOTRANSFORMATION',
              'TRANSPORT',
              'COMMUNICATION',
              'STRUCTURAL'
            ]
          },
          modules: {
            SCREENING: { questions: 75, required: true },
            ASSIMILATION: { questions: 65, threshold: 20 },
            DEFENSE_REPAIR: { questions: 60, threshold: 15 },
            ENERGY: { questions: 70, threshold: 25 },
            BIOTRANSFORMATION: { questions: 55, threshold: 15 },
            TRANSPORT: { questions: 50, threshold: 10 },
            COMMUNICATION: { questions: 75, threshold: 20 },
            STRUCTURAL: { questions: 45, threshold: 10 }
          },
          scoringRules: {
            adaptiveBranching: true,
            seedOilIntegrated: true,
            patternRecognition: true,
            minQuestions: 150,
            maxQuestions: 300,
            confidenceThreshold: 0.85
          },
          isActive: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Created default assessment template',
        template: {
          id: template.id,
          name: template.name,
          version: template.version
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Default template already exists',
      template: {
        id: template.id,
        name: template.name,
        version: template.version
      }
    });

  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create template'
    }, { status: 500 });
  }
}
