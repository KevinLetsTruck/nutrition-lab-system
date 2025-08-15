import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { questionBank } from "@/lib/assessment/questions";
import { assessmentModules } from "@/lib/assessment/modules";

export async function POST() {
  try {
    // Check if template already exists
    const existingTemplate = await prisma.assessmentTemplate.findFirst({
      where: { isActive: true },
    });

    if (existingTemplate) {
      // Update existing template
      const updated = await prisma.assessmentTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          questionBank: questionBank,
          modules: assessmentModules,
          scoringRules: {
            seedOilThresholds: {
              low: { min: 0, max: 3 },
              moderate: { min: 3, max: 6 },
              high: { min: 6, max: 8 },
              critical: { min: 8, max: 10 },
            },
            nodeActivation: {
              minimum: 3, // Minimum score to activate a node
              recommended: 5, // Recommended score for activation
            },
          },
          version: "1.0.1",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Assessment template updated",
        stats: {
          totalQuestions: questionBank.length,
          modules: assessmentModules.length,
          seedOilQuestions: questionBank.filter(
            (q) => q.category === "SEED_OIL"
          ).length,
          templateId: updated.id,
        },
      });
    }

    // Create new assessment template
    const template = await prisma.assessmentTemplate.create({
      data: {
        name: "Functional Medicine Assessment with Seed Oil Integration",
        version: "1.0.0",
        questionBank: questionBank,
        modules: assessmentModules,
        scoringRules: {
          seedOilThresholds: {
            low: { min: 0, max: 3 },
            moderate: { min: 3, max: 6 },
            high: { min: 6, max: 8 },
            critical: { min: 8, max: 10 },
          },
          nodeActivation: {
            minimum: 3,
            recommended: 5,
          },
        },
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assessment template created successfully",
      stats: {
        totalQuestions: questionBank.length,
        modules: assessmentModules.length,
        seedOilQuestions: questionBank.filter((q) => q.category === "SEED_OIL")
          .length,
        templateId: template.id,
      },
    });
  } catch (error) {
    console.error("Error seeding assessment:", error);
    return NextResponse.json(
      {
        error: "Failed to seed assessment template",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check current template
export async function GET() {
  try {
    const template = await prisma.assessmentTemplate.findFirst({
      where: { isActive: true },
    });

    if (!template) {
      return NextResponse.json(
        { error: "No active assessment template found" },
        { status: 404 }
      );
    }

    const stats = {
      id: template.id,
      name: template.name,
      version: template.version,
      totalQuestions: Array.isArray(template.questionBank)
        ? template.questionBank.length
        : 0,
      modules: Array.isArray(template.modules) ? template.modules.length : 0,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment template" },
      { status: 500 }
    );
  }
}
