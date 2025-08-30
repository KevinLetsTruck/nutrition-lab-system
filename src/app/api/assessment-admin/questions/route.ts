import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { z } from 'zod';
import { 
  COMPREHENSIVE_QUESTIONS, 
  SYSTEM_CATEGORIES, 
  SCORING_CONFIG,
  ASSESSMENT_STATISTICS,
  ComprehensiveQuestion
} from '@/lib/simple-assessment/comprehensive-questions';

// Question modification schema
const QuestionUpdateSchema = z.object({
  questionId: z.number(),
  updates: z.object({
    questionText: z.string().optional(),
    helpText: z.string().optional(),
    diagnosticWeight: z.number().min(0.5).max(3.0).optional(),
    isActive: z.boolean().optional(),
    testingNotes: z.string().optional(),
    clinicalNotes: z.string().optional(),
  }),
  reason: z.string(), // Reason for modification
});

// Scoring configuration update schema
const ScoringConfigSchema = z.object({
  systemWeights: z.record(z.string(), z.number().min(0.1).max(2.0)).optional(),
  severityThresholds: z.object({
    minimal: z.tuple([z.number(), z.number()]).optional(),
    mild: z.tuple([z.number(), z.number()]).optional(),
    moderate: z.tuple([z.number(), z.number()]).optional(),
    severe: z.tuple([z.number(), z.number()]).optional(),
    critical: z.tuple([z.number(), z.number()]).optional(),
  }).optional(),
});

// New question creation schema
const NewQuestionSchema = z.object({
  systemCategory: z.string(),
  subCategory: z.string(),
  questionText: z.string(),
  helpText: z.string().optional(),
  scaleType: z.enum(['frequency', 'severity', 'quality', 'consistency', 'satisfaction', 'energy', 'ease', 'level', 'regularity']),
  diagnosticWeight: z.number().min(0.5).max(3.0),
  reverseScore: z.boolean(),
  questionCluster: z.string(),
  rootCauseIndicator: z.boolean(),
  clinicalNotes: z.string(),
  modernFMUpdate: z.boolean().default(true),
  testingNotes: z.string().optional(),
});

// GET - Retrieve question configuration and analytics
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, allow all authenticated users to view question data
    // In production, you might want admin-only access
    
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');
    const subCategory = searchParams.get('subCategory');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const modernOnly = searchParams.get('modernOnly') === 'true';

    let questions = COMPREHENSIVE_QUESTIONS;

    // Apply filters
    if (system) {
      questions = questions.filter(q => q.systemCategory === system);
    }
    if (subCategory) {
      questions = questions.filter(q => q.subCategory === subCategory);
    }
    if (activeOnly) {
      questions = questions.filter(q => q.isActive);
    }
    if (modernOnly) {
      questions = questions.filter(q => q.modernFMUpdate);
    }

    // Calculate question analytics
    const analytics = calculateQuestionAnalytics(questions);

    return NextResponse.json({
      success: true,
      questions,
      systemCategories: SYSTEM_CATEGORIES,
      scoringConfig: SCORING_CONFIG,
      statistics: ASSESSMENT_STATISTICS,
      analytics,
      filters: {
        system,
        subCategory,
        activeOnly,
        modernOnly,
        totalResults: questions.length,
      },
    });

  } catch (error) {
    console.error('Error retrieving questions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve questions' },
      { status: 500 }
    );
  }
}

// POST - Create new question
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check when user roles are implemented
    // if (authUser.role !== 'admin') {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    // }

    const body = await request.json();
    const validation = NewQuestionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid question data',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const questionData = validation.data;

    // Generate new question ID
    const maxId = Math.max(...COMPREHENSIVE_QUESTIONS.map(q => q.id), 0);
    const newId = maxId + 1;

    const newQuestion: ComprehensiveQuestion = {
      id: newId,
      ...questionData,
      version: 1,
      isActive: true,
    };

    // TODO: In production, save to database instead of memory
    // For now, this is a read-only demonstration
    console.log('📝 New question would be created:', newQuestion);

    return NextResponse.json({
      success: true,
      question: newQuestion,
      message: `Question ${newId} created successfully`,
    });

  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing question or scoring configuration
export async function PUT(request: NextRequest) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check
    // if (authUser.role !== 'admin') {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    // }

    const body = await request.json();
    
    if (body.type === 'question') {
      const validation = QuestionUpdateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Invalid update data',
            details: validation.error.issues 
          },
          { status: 400 }
        );
      }

      const { questionId, updates, reason } = validation.data;

      // Find question to update
      const questionIndex = COMPREHENSIVE_QUESTIONS.findIndex(q => q.id === questionId);
      if (questionIndex === -1) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      // TODO: In production, update database and track change history
      console.log('📝 Question update would be applied:', {
        questionId,
        updates,
        reason,
        timestamp: new Date().toISOString(),
        updatedBy: authUser.id,
      });

      return NextResponse.json({
        success: true,
        message: `Question ${questionId} updated successfully`,
        changes: updates,
      });
    }
    
    if (body.type === 'scoring') {
      const validation = ScoringConfigSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Invalid scoring configuration',
            details: validation.error.issues 
          },
          { status: 400 }
        );
      }

      const updates = validation.data;

      // TODO: In production, update scoring configuration
      console.log('⚙️ Scoring configuration update would be applied:', updates);

      return NextResponse.json({
        success: true,
        message: 'Scoring configuration updated successfully',
        changes: updates,
      });
    }

    return NextResponse.json(
      { error: 'Invalid update type - must be "question" or "scoring"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }
}

// Helper function to calculate question analytics
function calculateQuestionAnalytics(questions: ComprehensiveQuestion[]) {
  const analytics = {
    totalQuestions: questions.length,
    activeQuestions: questions.filter(q => q.isActive).length,
    inactiveQuestions: questions.filter(q => !q.isActive).length,
    
    // By system
    systemBreakdown: Object.entries(SYSTEM_CATEGORIES).map(([key, config]) => ({
      system: key,
      name: config.name,
      questionCount: questions.filter(q => q.systemCategory === key).length,
      activeCount: questions.filter(q => q.systemCategory === key && q.isActive).length,
      targetCount: config.questionCount,
      completionPercentage: Math.round((questions.filter(q => q.systemCategory === key).length / config.questionCount) * 100),
    })),
    
    // Diagnostic weight distribution
    diagnosticWeightStats: {
      high: questions.filter(q => q.diagnosticWeight >= 2.5).length,      // High diagnostic value
      medium: questions.filter(q => q.diagnosticWeight >= 2.0 && q.diagnosticWeight < 2.5).length,
      standard: questions.filter(q => q.diagnosticWeight >= 1.5 && q.diagnosticWeight < 2.0).length,
      low: questions.filter(q => q.diagnosticWeight < 1.5).length,
    },
    
    // Root cause indicators
    rootCauseQuestions: questions.filter(q => q.rootCauseIndicator).length,
    secondaryQuestions: questions.filter(q => !q.rootCauseIndicator).length,
    
    // Modern FM questions
    modernFMQuestions: questions.filter(q => q.modernFMUpdate).length,
    traditionalQuestions: questions.filter(q => !q.modernFMUpdate).length,
    
    // Questions needing testing
    questionsWithTestingNotes: questions.filter(q => q.testingNotes).length,
    
    // Version tracking
    questionVersions: {
      v1: questions.filter(q => q.version === 1).length,
      // Add other versions as they're created
    },
  };

  return analytics;
}
