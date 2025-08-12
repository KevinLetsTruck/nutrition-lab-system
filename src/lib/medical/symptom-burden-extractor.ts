/**
 * Symptom Burden Report Extractor
 * Extracts nutritional deficiencies and conditions from Symptom Burden Reports
 */

import { ExtractedLabValue } from "./lab-extractor";

interface SymptomBurdenData {
  totalBurden?: number;
  deficiencies: ExtractedLabValue[];
  conditions: ExtractedLabValue[];
}

export class SymptomBurdenExtractor {
  /**
   * Extract data from Nutri-Q Severity Reports
   */
  extractSeverityReport(text: string): SymptomBurdenData {
    const results: ExtractedLabValue[] = [];
    const lines = text.split("\n");

    let currentSeverity = "";
    let totalBurden = 0;
    const clientMatch = text.match(/Client:\s*([^\n]+)/);
    const clientName = clientMatch ? clientMatch[1].trim() : "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect severity sections
      if (line === "Severe" || line === "Moderate" || line === "Minor") {
        currentSeverity = line;
        continue;
      }

      // Extract total burden if present
      const burdenMatch = line.match(/Total Symptom Burden:\s*(\d+)/);
      if (burdenMatch) {
        totalBurden = parseInt(burdenMatch[1]);
      }

      // Match lines with pattern: "number. description  category  score out of total"
      // Using more flexible regex to handle variable spacing
      const itemMatch = line.match(
        /^(\d+)\.\s+(.+?)\s{2,}(\w+(?:\s+\w+)*)\s{2,}(\d+)\s+out of\s+(\d+)$/
      );
      if (itemMatch) {
        const [_, questionNum, description, category, score, maxScore] =
          itemMatch;

        results.push({
          testName: description.trim(),
          value: parseInt(score),
          unit: "",
          referenceRange: `0-${maxScore}`,
          flag: currentSeverity.toUpperCase(),
          confidence: 1.0,
          standardName: "severity_item",
          category: category.trim(),
          valueText: `${score} out of ${maxScore}`,
          metadata: {
            severity: currentSeverity,
            questionNumber: parseInt(questionNum),
            maxScore: parseInt(maxScore),
            percentage: Math.round(
              (parseInt(score) / parseInt(maxScore)) * 100
            ),
            assessmentSection: "severity_report",
          },
        });
      }
    }

    return {
      totalBurden,
      deficiencies: [], // Severity reports don't have deficiencies
      conditions: results, // All items are conditions/factors
    };
  }

  /**
   * Extract data from Symptom Burden Report format
   */
  extractSymptomBurdenReport(text: string): SymptomBurdenData {
    const result: SymptomBurdenData = {
      deficiencies: [],
      conditions: [],
    };

    // Extract total symptom burden
    const totalMatch = text.match(/Total\s+Symptom\s+Burden:\s*(\d+)/i);
    if (totalMatch) {
      result.totalBurden = parseInt(totalMatch[1]);
    }

    // Split text into lines for processing
    const lines = text.split("\n").map((line) => line.trim());

    // Find sections
    let inDeficiencySection = false;
    let inConditionSection = false;
    let sectionStarted = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for section headers
      if (line.includes("Potential Nutritional Deficiencies")) {
        inDeficiencySection = true;
        inConditionSection = false;
        sectionStarted = false;
        continue;
      }

      if (line.includes("Potential Conditions")) {
        inDeficiencySection = false;
        inConditionSection = true;
        sectionStarted = false;
        continue;
      }

      // Skip until we find the header row
      if ((inDeficiencySection || inConditionSection) && !sectionStarted) {
        if (
          line.includes("Score") &&
          line.includes("Total Possible") &&
          line.includes("Percentage")
        ) {
          sectionStarted = true;
        }
        continue;
      }

      // Process data rows
      if (sectionStarted && line.length > 0) {
        // Stop at footer or empty sections
        if (
          line.includes("Statements made on this document") ||
          line.startsWith("practitioner")
        ) {
          break;
        }

        // Try to extract data from the line
        const extractedData = this.extractDataRow(
          line,
          lines[i + 1],
          lines[i + 2]
        );

        if (extractedData) {
          if (inDeficiencySection) {
            result.deficiencies.push(extractedData);
          } else if (inConditionSection) {
            result.conditions.push(extractedData);
          }

          // Skip processed lines
          if (extractedData.linesConsumed > 1) {
            i += extractedData.linesConsumed - 1;
          }
        }
      }
    }

    // Alternative extraction method if structured parsing fails
    if (result.deficiencies.length === 0 && result.conditions.length === 0) {
      result.deficiencies = this.extractDeficienciesAlternative(text);
      result.conditions = this.extractConditionsAlternative(text);
    }

    return result;
  }

  /**
   * Extract a data row (may span multiple lines)
   */
  private extractDataRow(
    line1: string,
    line2?: string,
    line3?: string
  ): (ExtractedLabValue & { linesConsumed: number }) | null {
    // Pattern 1: All data on one line
    // Example: "Essential Fatty Acids  35  129  27%"
    let match = line1.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)%$/);

    if (match) {
      return this.createLabValue(
        match[1].trim(),
        parseInt(match[2]),
        parseInt(match[3]),
        parseInt(match[4]),
        1
      );
    }

    // Pattern 2: Name and score on one line, rest on next
    // Example: "Vitamin B6  11" then "25  44%"
    if (line2) {
      match = line1.match(/^(.+?)\s+(\d+)$/);
      const match2 = line2?.match(/^(\d+)\s+(\d+)%$/);

      if (match && match2) {
        return this.createLabValue(
          match[1].trim(),
          parseInt(match[2]),
          parseInt(match2[1]),
          parseInt(match2[2]),
          2
        );
      }
    }

    // Pattern 3: Each value on separate line
    if (line2 && line3) {
      const scoreLine = line1.match(/^\d+$/);
      const totalLine = line2?.match(/^\d+$/);
      const percentLine = line3?.match(/^(\d+)%$/);

      if (scoreLine && totalLine && percentLine) {
        // Need to look back for the name
        return null; // This pattern is too complex for current implementation
      }
    }

    return null;
  }

  /**
   * Alternative extraction using regex patterns
   */
  private extractDeficienciesAlternative(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = [];

    // Common nutritional deficiencies to look for
    const deficiencyPatterns = [
      /Essential\s+Fatty\s+Acids\s+(\d+)\s+(\d+)\s+(\d+)%/gi,
      /Minerals?\s+(.+?)\s+(\d+)\s+(\d+)\s+(\d+)%/gi,
      /Vitamin\s+([A-Z0-9]+)\s+(\d+)\s+(\d+)\s+(\d+)%/gi,
      /Protein\s+Need\s+(\d+)\s+(\d+)\s+(\d+)%/gi,
      /([A-Za-z\s]+?)\s+(\d+)\s+(\d+)\s+(\d+)%/gi,
    ];

    // Extract deficiencies section
    const deficiencySection = this.extractSection(
      text,
      "Potential Nutritional Deficiencies",
      "Potential Conditions"
    );

    for (const pattern of deficiencyPatterns) {
      let match;
      while ((match = pattern.exec(deficiencySection)) !== null) {
        let name = "";
        let score = 0;
        let total = 0;
        let percentage = 0;

        if (match.length === 5) {
          // Pattern with subtype (e.g., "Minerals Alkaline Ash")
          name = match[0].split(/\s+\d+/)[0].trim();
          score = parseInt(match[match.length - 3]);
          total = parseInt(match[match.length - 2]);
          percentage = parseInt(match[match.length - 1]);
        } else if (match.length === 4) {
          name = match[1].trim();
          score = parseInt(match[2]);
          total = parseInt(match[3]);
          percentage = parseInt(match[4]);
        }

        if (name && !values.some((v) => v.testName === name)) {
          values.push(this.createLabValue(name, score, total, percentage, 0));
        }
      }
    }

    return values;
  }

  /**
   * Alternative extraction for conditions
   */
  private extractConditionsAlternative(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = [];

    // Extract conditions section
    const conditionSection = this.extractSection(
      text,
      "Potential Conditions",
      "Statements made"
    );

    // General pattern for conditions
    const conditionPattern = /([A-Za-z\s\-\/]+?)\s+(\d+)\s+(\d+)\s+(\d+)%/g;

    let match;
    while ((match = conditionPattern.exec(conditionSection)) !== null) {
      const name = match[1].trim();
      const score = parseInt(match[2]);
      const total = parseInt(match[3]);
      const percentage = parseInt(match[4]);

      // Skip if this looks like a header or already extracted
      if (
        name.length > 3 &&
        !name.includes("Score") &&
        !name.includes("Total") &&
        !values.some((v) => v.testName === name)
      ) {
        values.push(this.createLabValue(name, score, total, percentage, 0));
      }
    }

    return values;
  }

  /**
   * Extract a section of text between two markers
   */
  private extractSection(
    text: string,
    startMarker: string,
    endMarker: string
  ): string {
    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker, startIndex + 1);

    if (startIndex === -1) return "";
    if (endIndex === -1) return text.substring(startIndex);

    return text.substring(startIndex, endIndex);
  }

  /**
   * Create a lab value object
   */
  private createLabValue(
    name: string,
    score: number,
    totalPossible: number,
    percentage: number,
    linesConsumed: number
  ): ExtractedLabValue & { linesConsumed: number } {
    // Determine severity based on percentage
    let severity: "low" | "normal" | "high" | "critical" = "normal";
    if (percentage >= 50) severity = "critical";
    else if (percentage >= 40) severity = "high";
    else if (percentage >= 25) severity = "normal";
    else severity = "low";

    return {
      testName: name,
      standardName: name.toLowerCase().includes("condition")
        ? "symptom_condition"
        : "nutritional_deficiency",
      value: score,
      valueText: `${score}/${totalPossible} (${percentage}%)`,
      unit: "score",
      referenceRange: `0-${totalPossible}`,
      flag: severity,
      documentType: "SYMPTOM_BURDEN",
      confidence: 0.9,
      rawText: `${name} ${score} ${totalPossible} ${percentage}%`,
      metadata: {
        score,
        totalPossible,
        percentage,
        category: name.toLowerCase().includes("condition")
          ? "condition"
          : "deficiency",
      },
      linesConsumed,
    };
  }

  /**
   * Process symptom burden bar graph (visual chart)
   */
  extractSymptomBurdenBarGraph(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = [];

    // For bar graphs, we often get priority sections
    const priorityPattern =
      /(Low|Medium|High)\s+Priority[:\s]*([\s\S]+?)(?=(?:Low|Medium|High)\s+Priority|$)/gi;

    let match;
    while ((match = priorityPattern.exec(text)) !== null) {
      const priority = match[1];
      const content = match[2];

      // Extract categories within each priority
      const categoryPattern = /([A-Za-z\s&]+?)[\s:]+(\d+)/g;
      let catMatch;

      while ((catMatch = categoryPattern.exec(content)) !== null) {
        const category = catMatch[1].trim();
        const score = parseInt(catMatch[2]);

        // Skip if it looks like noise
        if (category.length < 3 || score > 100) continue;

        values.push({
          testName: `Symptom Burden: ${category}`,
          standardName: "symptom_burden_score",
          value: score,
          valueText: score.toString(),
          priority: priority,
          assessmentSection: category,
          documentType: "SYMPTOM_BURDEN",
          flag: score >= 8 ? "high" : score >= 5 ? "normal" : "low",
          confidence: 0.8,
          rawText: catMatch[0],
        });
      }
    }

    // If no priority sections found, try simple extraction
    if (values.length === 0) {
      const simplePattern = /([A-Za-z\s&]+?):\s*(\d+)/g;
      while ((match = simplePattern.exec(text)) !== null) {
        const name = match[1].trim();
        const score = parseInt(match[2]);

        if (this.isValidCategoryName(name) && score <= 50) {
          values.push({
            testName: `Symptom Burden: ${name}`,
            standardName: "symptom_burden_score",
            value: score,
            valueText: score.toString(),
            assessmentSection: name,
            documentType: "SYMPTOM_BURDEN",
            flag: score >= 8 ? "high" : score >= 5 ? "normal" : "low",
            confidence: 0.7,
            rawText: match[0],
          });
        }
      }
    }

    return values;
  }

  private isValidCategoryName(name: string): boolean {
    const validCategories = [
      "Upper GI",
      "Liver",
      "Gallbladder",
      "Small Intestine",
      "Large Intestine",
      "Minerals",
      "Fatty Acids",
      "Sugar Handling",
      "Vitamin",
      "Adrenal",
      "Pituitary",
      "Thyroid",
      "Health",
      "Cardiovascular",
      "Kidney",
      "Bladder",
      "Immune",
      "Hormone",
      "Digestive",
      "Energy",
      "Stress",
    ];

    return validCategories.some((cat) =>
      name.toLowerCase().includes(cat.toLowerCase())
    );
  }
}

export const symptomBurdenExtractor = new SymptomBurdenExtractor();
