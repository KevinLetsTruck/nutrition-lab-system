// Claude Analysis Parser
// Automatically detects and extracts sections from Claude Desktop analysis

export interface ParsedAnalysis {
  executiveSummary?: string;
  systemAnalysis?: any;
  rootCauseAnalysis?: string;
  protocolRecommendations?: any;
  monitoringPlan?: string;
  patientEducation?: string;
  fullAnalysis: string;
}

const SECTION_PATTERNS = {
  executiveSummary: [
    /## Executive Summary(.*?)(?=##|$)/is,
    /# Executive Summary(.*?)(?=#|$)/is,
    /\*\*Executive Summary\*\*(.*?)(?=\*\*|$)/is,
    /EXECUTIVE SUMMARY(.*?)(?=\n\n|$)/is
  ],
  systemAnalysis: [
    /## System-by-System Analysis(.*?)(?=##|$)/is,
    /## System Analysis(.*?)(?=##|$)/is,
    /# Pattern Analysis(.*?)(?=#|$)/is,
    /\*\*System Analysis\*\*(.*?)(?=\*\*|$)/is,
    /SYSTEM ANALYSIS(.*?)(?=\n\n|$)/is
  ],
  rootCauseAnalysis: [
    /## Root Cause Analysis(.*?)(?=##|$)/is,
    /# Root Cause(.*?)(?=#|$)/is,
    /\*\*Root Cause\*\*(.*?)(?=\*\*|$)/is,
    /ROOT CAUSE(.*?)(?=\n\n|$)/is
  ],
  protocolRecommendations: [
    /## Protocol Recommendations(.*?)(?=##|$)/is,
    /## Treatment Protocol(.*?)(?=##|$)/is,
    /# Protocol(.*?)(?=#|$)/is,
    /\*\*Protocol\*\*(.*?)(?=\*\*|$)/is,
    /PROTOCOL(.*?)(?=\n\n|$)/is
  ],
  monitoringPlan: [
    /## Monitoring Plan(.*?)(?=##|$)/is,
    /## Follow-up(.*?)(?=##|$)/is,
    /# Monitoring(.*?)(?=#|$)/is,
    /\*\*Monitoring\*\*(.*?)(?=\*\*|$)/is,
    /MONITORING(.*?)(?=\n\n|$)/is
  ],
  patientEducation: [
    /## Patient Education(.*?)(?=##|$)/is,
    /## Client Education(.*?)(?=##|$)/is,
    /# Education(.*?)(?=#|$)/is,
    /\*\*Patient Education\*\*(.*?)(?=\*\*|$)/is,
    /PATIENT EDUCATION(.*?)(?=\n\n|$)/is
  ]
};

function extractSection(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function parseProtocolSection(protocolText: string): any {
  if (!protocolText) return null;

  const protocol: any = {};
  
  // Extract supplements
  const supplementsMatch = protocolText.match(/supplements?:?\s*(.*?)(?=diet|lifestyle|monitoring|$)/is);
  if (supplementsMatch) {
    const supplements = supplementsMatch[1]
      .split(/[-•]\s/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    protocol.supplements = supplements;
  }

  // Extract dietary guidelines
  const dietMatch = protocolText.match(/diet(?:ary)?:?\s*(.*?)(?=lifestyle|supplement|monitoring|$)/is);
  if (dietMatch) {
    const dietary = dietMatch[1]
      .split(/[-•]\s/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    protocol.dietary = dietary;
  }

  // Extract lifestyle modifications
  const lifestyleMatch = protocolText.match(/lifestyle:?\s*(.*?)(?=diet|supplement|monitoring|$)/is);
  if (lifestyleMatch) {
    const lifestyle = lifestyleMatch[1]
      .split(/[-•]\s/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    protocol.lifestyle = lifestyle;
  }

  return Object.keys(protocol).length > 0 ? protocol : null;
}

function parseSystemAnalysis(systemText: string): any {
  if (!systemText) return null;

  const systems: any = {};
  
  // Common functional medicine systems
  const systemKeywords = [
    'digestive', 'adrenal', 'thyroid', 'liver', 'detox', 'immune',
    'cardiovascular', 'nervous', 'hormonal', 'reproductive', 'urinary'
  ];

  systemKeywords.forEach(system => {
    const pattern = new RegExp(`${system}.*?(?=\n\n|$)`, 'is');
    const match = systemText.match(pattern);
    if (match) {
      systems[system] = match[0].trim();
    }
  });

  return Object.keys(systems).length > 0 ? systems : null;
}

export function parseClaudeAnalysis(analysisText: string): ParsedAnalysis {
  const parsed: ParsedAnalysis = {
    fullAnalysis: analysisText
  };

  // Extract each section using pattern matching
  Object.entries(SECTION_PATTERNS).forEach(([section, patterns]) => {
    const extracted = extractSection(analysisText, patterns);
    if (extracted) {
      if (section === 'protocolRecommendations') {
        parsed[section as keyof ParsedAnalysis] = parseProtocolSection(extracted) as any;
      } else if (section === 'systemAnalysis') {
        parsed[section as keyof ParsedAnalysis] = parseSystemAnalysis(extracted) as any;
      } else {
        (parsed as any)[section] = extracted;
      }
    }
  });

  return parsed;
}

export function validateAnalysis(analysis: ParsedAnalysis): string[] {
  const errors: string[] = [];

  if (!analysis.fullAnalysis || analysis.fullAnalysis.trim().length < 100) {
    errors.push('Analysis text is too short (minimum 100 characters)');
  }

  if (!analysis.executiveSummary && !analysis.systemAnalysis && !analysis.protocolRecommendations) {
    errors.push('No recognizable sections found - please check formatting');
  }

  return errors;
}

export function generateAnalysisSummary(analysis: ParsedAnalysis): string {
  const sections = [];
  
  if (analysis.executiveSummary) sections.push('Executive Summary');
  if (analysis.systemAnalysis) sections.push('System Analysis');
  if (analysis.rootCauseAnalysis) sections.push('Root Cause Analysis');
  if (analysis.protocolRecommendations) sections.push('Protocol Recommendations');
  if (analysis.monitoringPlan) sections.push('Monitoring Plan');
  if (analysis.patientEducation) sections.push('Patient Education');

  return sections.length > 0 
    ? `Parsed ${sections.length} sections: ${sections.join(', ')}`
    : 'Full analysis text only (no structured sections detected)';
}
