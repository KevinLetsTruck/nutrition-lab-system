import { LabValueExtractor } from "../src/lib/medical/lab-extractor";

const extractor = new LabValueExtractor();

// Test value from the extraction
const testValue = {
  testName: "NAQ Q1",
  standardName: "naq_question",
  value: null,
  valueText: "Alcohol",
  documentType: "NAQ",
  questionNumber: 1,
  symptomText: "Alcohol",
  category: "General",
  assessmentSection: "General",
  flag: "normal",
  confidence: 0.9,
  rawText: "1. 0 1 2 3 Alcohol 0 1 2 3 Alcohol",
  position: 2,
};

console.log("Testing validation on extracted NAQ value:");
console.log(JSON.stringify(testValue, null, 2));

// Test validation
const isValid = (extractor as any).isValidLabValue(testValue, "NAQ");
console.log("\nIs valid:", isValid);

// Test individual checks
console.log("\nIndividual checks:");
console.log("  Has testName:", !!testValue.testName);
console.log("  Has confidence:", typeof testValue.confidence === "number");
console.log("  Confidence > 0:", testValue.confidence > 0);
console.log("  Test name length:", testValue.testName.length);
console.log(
  "  Is header:",
  (extractor as any).isDocumentHeader(testValue.testName)
);

// Check NAQ-specific validation
const isValidNAQ = (extractor as any).isValidNAQValue(testValue);
console.log("\nNAQ-specific validation:", isValidNAQ);
console.log("  Has question number:", !!testValue.questionNumber);
console.log(
  "  Question number valid:",
  testValue.questionNumber >= 0 && testValue.questionNumber <= 400
);
console.log("  Has symptom text:", !!testValue.symptomText);
console.log("  Symptom text length:", testValue.symptomText?.length);
console.log("  Standard name:", testValue.standardName);
