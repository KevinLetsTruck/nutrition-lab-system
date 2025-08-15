import { NextRequest, NextResponse } from "next/server";
import { QuestionType, FunctionalModule, QuestionCategory } from "@/lib/assessment/types";

export async function GET(req: NextRequest) {
  // Return a test question to verify rendering
  const testQuestion = {
    id: "TEST_Q1",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "Have you noticed improved energy or reduced inflammation when avoiding seed oils?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { value: "yes_significant", label: "Yes, significant improvement", score: 0 },
      { value: "yes_some", label: "Yes, some improvement", score: 2 },
      { value: "no_change", label: "No change noticed", score: 5 },
      { value: "never_tried", label: "Never tried avoiding them", score: 7 },
      { value: "worse", label: "Feel worse when I avoid them", score: 3 }
    ],
    scoringWeight: 1.6,
    clinicalRelevance: ["metabolic_flexibility", "inflammation_response"],
    helpText: "Your body's response to seed oil elimination can indicate metabolic health"
  };

  return NextResponse.json({
    success: true,
    data: {
      question: testQuestion,
      debug: {
        typeValue: testQuestion.type,
        typeString: QuestionType.MULTIPLE_CHOICE,
        matches: testQuestion.type === QuestionType.MULTIPLE_CHOICE
      }
    }
  });
}
