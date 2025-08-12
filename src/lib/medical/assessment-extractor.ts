/**
 * Assessment Form Extractor
 * Specialized extraction for NAQ and Symptom Burden assessments
 */

import { ExtractedLabValue } from "./lab-extractor";

export class AssessmentExtractor {
  /**
   * Extract NAQ (Nutritional Assessment Questionnaire) values
   * Handles the multi-line format where numbers and symptoms are on different lines
   */
  extractNAQValues(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = [];

    // The OCR text might be on a single line, so let's also try splitting by question numbers
    let lines = text.split("\n").map((line) => line.trim());

    // If there's only one or few lines, try to split by question pattern
    if (lines.length <= 5) {
      // Split by question numbers (e.g., "52. 0 1 2 3")
      const questionSplits = text.split(/(?=\d+\.\s+0\s+1)/);
      if (questionSplits.length > 10) {
        lines = questionSplits.map((line) => line.trim());
      }
    }

    let currentSection = "General";
    let questionNumber = 0;

    // Track responses - which numbers were circled
    const responsePattern = /\(?\s*([0-3])\s*\)?/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Check for section headers
      if (this.isSectionHeader(line)) {
        currentSection = line;
        continue;
      }

      // Check for question number line (e.g., "52." or "52. 0 1 2 3")
      const questionMatch = line.match(/^(\d+)\.\s*(.*)?$/);
      if (questionMatch) {
        questionNumber = parseInt(questionMatch[1]);

        // Look for symptom text on the same line or next lines
        let symptomText = "";
        let responseValue = null;

        // Check if there's text after the number on the same line
        const afterNumber = questionMatch[2]?.trim();
        if (afterNumber && !this.isJustNumbers(afterNumber)) {
          symptomText = afterNumber;
        } else {
          // Look ahead for the symptom text
          for (let j = i + 1; j < lines.length && j < i + 5; j++) {
            const nextLine = lines[j];
            if (!nextLine) continue;

            // Stop if we hit another question number
            if (/^\d+\./.test(nextLine)) break;

            // Skip lines that are just "0 1 2 3"
            if (this.isJustNumbers(nextLine)) continue;

            // This should be the symptom text
            symptomText = nextLine;
            break;
          }
        }

        // Look for circled responses in nearby lines
        for (
          let j = Math.max(0, i - 2);
          j < Math.min(lines.length, i + 3);
          j++
        ) {
          const checkLine = lines[j];
          // Look for patterns like (2) or circled numbers
          const circledMatch = checkLine.match(/\(([0-3])\)/);
          if (circledMatch && Math.abs(j - i) <= 2) {
            responseValue = parseInt(circledMatch[1]);
            break;
          }
        }

        if (symptomText && questionNumber) {
          // Clean up symptom text - remove the scale numbers if present
          const cleanSymptom = symptomText
            .replace(/^0\s+1\s+2\s+3\s+/, "")
            .trim();

          const extractedValue: ExtractedLabValue = {
            testName: `NAQ Q${questionNumber}`,
            standardName: "naq_question",
            value: responseValue,
            valueText: cleanSymptom,
            documentType: "NAQ",
            questionNumber,
            symptomText: cleanSymptom,
            category: currentSection,
            assessmentSection: currentSection,
            flag: this.getResponseFlag(responseValue),
            confidence: cleanSymptom.length > 5 ? 0.9 : 0.5,
            rawText: `${line} ${symptomText}`,
            position: i,
          };

          values.push(extractedValue);
        }
      }

      // Look for section totals (e.g., "Upper GI Total: 15")
      const totalMatch = line.match(/([A-Za-z\s&]+?)(?:Total|Score):\s*(\d+)/i);
      if (totalMatch) {
        const sectionName = totalMatch[1].trim();
        const score = parseInt(totalMatch[2]);

        values.push({
          testName: `${sectionName} Total`,
          standardName: "naq_section_total",
          value: score,
          valueText: score.toString(),
          documentType: "NAQ",
          assessmentSection: sectionName,
          flag: this.getSectionFlag(score),
          confidence: 0.95,
          rawText: line,
        });
      }
    }

    // If we didn't extract many values, try alternative approach
    if (values.length < 10) {
      return this.extractNAQValuesAlternative(text);
    }

    return values;
  }

  /**
   * Alternative NAQ extraction for when text is in a continuous format
   */
  private extractNAQValuesAlternative(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = [];

    // Enhanced pattern to capture circled responses
    // Matches: "1. (0) 1 2 3 Alcohol" or "52. 0 (1) 2 3 Symptom"
    const questionWithResponsePattern =
      /(\d+)\.\s*\(?([0-3])\)?\s*\(?([0-3])\)?\s*\(?([0-3])\)?\s*\(?([0-3])\)?\s*([^0-9]+?)(?=\d+\.\s*\(?[0-3]|$)/g;

    // Also try the original pattern
    const questionPattern =
      /(\d+)\.\s+0\s+1\s+2\s+3\s+([^0-9]+?)(?=\d+\.\s+0\s+1|$)/g;

    // First try to extract with response pattern
    let matches = [...text.matchAll(questionWithResponsePattern)];
    let useResponsePattern = matches.length > 10;

    if (!useResponsePattern) {
      matches = [...text.matchAll(questionPattern)];
    }

    let currentSection = "General";

    // Track section changes
    const sectionPattern =
      /(Upper Gastrointestinal|Liver and Gallbladder|Small Intestine|Large Intestine|Mineral Needs|Essential Fatty Acids|Sugar Handling|Vitamin Need|Adrenal|Pituitary|Thyroid|Female Reproductive|Male Hormonal|Cardiovascular|Kidney and Bladder|Immune System)/gi;

    for (const match of matches) {
      const questionNum = parseInt(match[1]);
      let symptomText = "";
      let selectedValue = null;

      if (useResponsePattern) {
        // Check which number has parentheses
        for (let i = 0; i < 4; i++) {
          const numMatch = match[2 + i];
          if (numMatch && match[0].includes(`(${i})`)) {
            selectedValue = i;
          }
        }
        symptomText = match[6]?.trim() || "";
      } else {
        symptomText = match[2]?.trim() || "";
      }

      // Clean up symptom text
      symptomText = symptomText.replace(/\s+/g, " ").trim();

      // Check if we're in a new section
      const sectionCheck = symptomText.match(sectionPattern);
      if (sectionCheck) {
        currentSection = sectionCheck[0];
        // Remove section name from symptom text
        symptomText = symptomText.replace(sectionPattern, "").trim();
      }

      // Skip if symptom text is too short or looks invalid
      if (symptomText.length < 5 || symptomText.length > 200) continue;

      const value: ExtractedLabValue = {
        testName: `NAQ Q${questionNum}`,
        standardName: "naq_question",
        value: selectedValue,
        valueText: symptomText,
        documentType: "NAQ",
        questionNumber: questionNum,
        symptomText,
        category: currentSection,
        assessmentSection: currentSection,
        flag: this.getResponseFlag(selectedValue),
        confidence: selectedValue !== null ? 0.9 : 0.7,
        rawText: match[0],
      };

      values.push(value);
    }

    // Also extract questions with just "0 1" pattern (yes/no questions)
    const yesNoPattern = /(\d+)\.\s+0\s+1\s+([^0-9]+?)(?=\d+\.\s+0\s+1|$)/g;
    const yesNoMatches = [...text.matchAll(yesNoPattern)];

    for (const match of yesNoMatches) {
      const questionNum = parseInt(match[1]);
      let symptomText = match[2].trim();

      // Skip if we already have this question
      if (values.some((v) => v.questionNumber === questionNum)) continue;

      // Clean up symptom text
      symptomText = symptomText.replace(/\s+/g, " ").trim();

      if (symptomText.length < 5 || symptomText.length > 200) continue;

      const value: ExtractedLabValue = {
        testName: `NAQ Q${questionNum}`,
        standardName: "naq_question_binary",
        valueText: symptomText,
        documentType: "NAQ",
        questionNumber: questionNum,
        symptomText,
        category: currentSection,
        assessmentSection: currentSection,
        flag: "normal",
        confidence: 0.8,
        rawText: match[0],
      };

      values.push(value);
    }

    return values;
  }

  /**
   * Extract Symptom Burden Bar Graph values
   * This handles the visual representation of symptom scores
   */
  extractSymptomBurdenValues(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = [];
    const lines = text.split("\n").map((line) => line.trim());

    // Common symptom categories in the bar graph
    const categories = [
      "Upper GI",
      "Liver & GB",
      "Sm Intestine",
      "Lg Intestine",
      "Minerals",
      "Fatty Acids",
      "Sugar Handling",
      "Vitamin Need",
      "Adrenal",
      "Pituitary",
      "Thyroid",
      "Men's Health",
      "Women's Health",
      "Cardiovascular",
      "Kidney & Bladder",
      "Immune",
    ];

    // Look for priority indicators
    let inPrioritySection = false;
    let currentPriority = "Medium";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for priority sections
      if (line.includes("High Priority")) {
        currentPriority = "High";
        inPrioritySection = true;
        continue;
      } else if (line.includes("Medium Priority")) {
        currentPriority = "Medium";
        inPrioritySection = true;
        continue;
      } else if (line.includes("Low Priority")) {
        currentPriority = "Low";
        inPrioritySection = true;
        continue;
      }

      // Look for category names followed by numbers
      for (const category of categories) {
        if (line.includes(category)) {
          // Look for numbers on the same line or next line
          let numbers: number[] = [];

          // Extract numbers from current line
          const currentNumbers = line.match(/\d+/g);
          if (currentNumbers) {
            numbers.push(...currentNumbers.map((n) => parseInt(n)));
          }

          // Check next line for numbers
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextNumbers = nextLine.match(/\d+/g);
            if (nextNumbers && nextNumbers.length > 0) {
              numbers.push(...nextNumbers.map((n) => parseInt(n)));
            }
          }

          // If we found numbers, use the last one as the score
          if (numbers.length > 0) {
            const score = numbers[numbers.length - 1];

            values.push({
              testName: `Symptom Burden: ${category}`,
              standardName: "symptom_burden_score",
              value: score,
              valueText: `${score} (${currentPriority} Priority)`,
              documentType: "SYMPTOM_BURDEN",
              assessmentSection: category,
              category: "Symptom Burden",
              priority: currentPriority,
              flag: this.getSymptomBurdenFlag(score),
              confidence: 0.8,
              rawText: line,
            });
          }
        }
      }
    }

    // Calculate total symptom burden if we have values
    if (values.length > 0) {
      const totalScore = values.reduce((sum, v) => sum + (v.value || 0), 0);
      values.push({
        testName: "Total Symptom Burden Score",
        standardName: "total_symptom_burden",
        value: totalScore,
        valueText: totalScore.toString(),
        documentType: "SYMPTOM_BURDEN",
        assessmentSection: "Total",
        flag: totalScore > 50 ? "high" : totalScore > 25 ? "normal" : "low",
        confidence: 0.9,
        rawText: "Calculated total",
      });
    }

    return values;
  }

  private isSectionHeader(line: string): boolean {
    const headerPatterns = [
      /System$/i,
      /Need$/i,
      /^(Upper|Lower)\s+(GI|Gastrointestinal)/i,
      /^Liver.*Gallbladder/i,
      /^(Small|Large)\s+Intestine/i,
      /^(Adrenal|Thyroid|Pituitary)/i,
      /^Cardiovascular/i,
      /^Immune/i,
      /^(Men's|Women's)\s+Health/i,
    ];

    return headerPatterns.some((pattern) => pattern.test(line));
  }

  private isJustNumbers(text: string): boolean {
    // Check if the line is just "0 1 2 3" or similar
    const cleaned = text.replace(/\s+/g, "");
    return /^[0-3\s]+$/.test(text) && cleaned.length <= 4;
  }

  private getResponseFlag(value: number | null): string {
    if (value === null) return "normal";
    if (value >= 3) return "high";
    if (value >= 2) return "normal";
    return "low";
  }

  private getSectionFlag(score: number): string {
    if (score > 20) return "high";
    if (score > 10) return "normal";
    return "low";
  }

  private getSymptomBurdenFlag(score: number): string {
    if (score >= 8) return "high";
    if (score >= 4) return "normal";
    return "low";
  }
}

export const assessmentExtractor = new AssessmentExtractor();
