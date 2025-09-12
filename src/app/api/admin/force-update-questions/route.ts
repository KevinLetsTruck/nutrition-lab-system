/**
 * Admin Endpoint: Force Update Production Questions
 * 
 * Updates the actual Railway production database with optimized questions
 * Must be called from production domain to ensure correct database connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// All critical question fixes
const CRITICAL_QUESTION_FIXES = [
  { id: 1, newText: 'How does eating affect your immediate digestive comfort (belching, gas, bloating)?' },
  { id: 2, newText: 'How does your stomach handle normal-sized meals?' },
  { id: 3, newText: 'How frequently do you experience heartburn or acid reflux?' },
  { id: 4, newText: 'How completely does your body appear to digest food?' },
  { id: 5, newText: 'How do vitamins or supplements affect your stomach?' },
  { id: 6, newText: 'How is your appetite for protein and meat?' },
  { id: 7, newText: 'How does using electronic devices during meals affect your digestion?' },
  { id: 8, newText: 'How does stress affect your digestive symptoms?' },
  { id: 9, newText: 'How does eating in high-tech environments (WiFi, cell towers) affect your digestion?' },
  { id: 10, newText: 'How is your morning appetite and desire for breakfast?' },
  { id: 11, newText: 'How does your evening meal timing affect your digestion?' },
  { id: 12, newText: 'How do seasonal changes affect your digestive symptoms?' },
  { id: 13, newText: 'How do carbohydrate-rich foods affect your digestive comfort?' },
  { id: 14, newText: 'How does going without eating for 12+ hours affect your digestive symptoms?' },
  { id: 15, newText: 'How do fermented foods (kombucha, sauerkraut, yogurt) affect how you feel?' }
];

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Force updating production questions to eliminate "How often" language...');

    // Simple production check
    const origin = request.headers.get('origin') || request.headers.get('referer') || '';
    const isProduction = origin.includes('nutrition-lab-system-production-0fa7.up.railway.app') || origin.includes('railway.app');
    
    if (!isProduction && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint can only be called from production domain' }, 
        { status: 403 }
      );
    }

    // Update the critical first 15 questions
    let updatedCount = 0;
    const results = [];

    for (const fix of CRITICAL_QUESTION_FIXES) {
      try {
        const updateResult = await prisma.fmDigestiveQuestion.updateMany({
          where: { id: fix.id },
          data: {
            questionText: fix.newText,
            updatedAt: new Date()
          }
        });
        
        if (updateResult.count > 0) {
          updatedCount++;
          results.push({ questionId: fix.id, status: 'updated', text: fix.newText });
        } else {
          results.push({ questionId: fix.id, status: 'not_found' });
        }
      } catch (updateError) {
        results.push({ questionId: fix.id, status: 'error', error: updateError.message });
      }
    }

    // Verify Question 1 is updated
    const question1 = await prisma.fmDigestiveQuestion.findFirst({
      where: { displayOrder: 1 },
      select: {
        questionText: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} critical questions in production database`,
      data: {
        updatedQuestions: updatedCount,
        totalAttempted: CRITICAL_QUESTION_FIXES.length,
        question1Status: {
          text: question1?.questionText,
          hasOldFormat: question1?.questionText.includes('How often do you'),
          updatedAt: question1?.updatedAt
        },
        updateResults: results
      }
    });
    
  } catch (error) {
    console.error('❌ Production question update failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update questions',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    // Check current question status
    const question1 = await prisma.fmDigestiveQuestion.findFirst({
      where: { displayOrder: 1 },
      select: {
        questionText: true,
        updatedAt: true
      }
    });

    const totalQuestions = await prisma.fmDigestiveQuestion.count({
      where: { isActive: true }
    });

    const howOftenCount = await prisma.fmDigestiveQuestion.count({
      where: { 
        questionText: { contains: 'How often do you' },
        isActive: true 
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions,
        questionsWithHowOften: howOftenCount,
        percentageOptimized: Math.round(((totalQuestions - howOftenCount) / totalQuestions) * 100),
        question1: {
          text: question1?.questionText,
          hasOldFormat: question1?.questionText.includes('How often do you'),
          updatedAt: question1?.updatedAt
        },
        needsUpdate: howOftenCount > 0
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check question status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
