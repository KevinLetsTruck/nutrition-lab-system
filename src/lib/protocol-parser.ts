// Enhanced protocol parser for Claude Desktop generated protocols
import { randomBytes } from 'crypto';

export interface ParsedProtocol {
  phases: ProtocolPhase[];
  supplements: SupplementRecommendation[];
  lifestyle: LifestyleIntervention[];
  monitoring: MonitoringPlan[];
  timeline: ProtocolTimeline;
  coachingNotes: CoachingNote[];
}

export interface ProtocolPhase {
  id: string;
  name: string;
  duration: string;
  goals: string[];
  supplements: SupplementRecommendation[];
  lifestyle: LifestyleIntervention[];
  successCriteria: string[];
  nextPhaseConditions: string[];
}

export interface SupplementRecommendation {
  id: string;
  name: string;
  letstruck_sku?: string;
  biotiics_alternative?: string;
  fullscript_backup?: string;
  dosage: string;
  timing: string;
  duration: string;
  purpose: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  phase: string;
  trucker_instructions: string;
  monitoring_notes?: string;
}

export interface LifestyleIntervention {
  id: string;
  category: 'DIET' | 'EXERCISE' | 'SLEEP' | 'STRESS' | 'HYDRATION';
  intervention: string;
  instructions: string;
  frequency: string;
  phase: string;
  trucker_specific: boolean;
}

export interface MonitoringPlan {
  metric: string;
  frequency: string;
  target: string;
  method: 'SELF_REPORT' | 'LAB_TEST' | 'MEASUREMENT';
  phase: string;
}

export interface ProtocolTimeline {
  total_duration: string;
  phase_transitions: {
    from_phase: string;
    to_phase: string;
    trigger_conditions: string[];
    estimated_date: string;
  }[];
  follow_up_schedule: {
    interval: string;
    type: 'CHECK_IN' | 'LAB_REVIEW' | 'PROTOCOL_ADJUSTMENT';
    description: string;
  }[];
}

export interface CoachingNote {
  id: string;
  category: 'EDUCATION' | 'MOTIVATION' | 'TROUBLESHOOTING' | 'EXPECTATIONS';
  content: string;
  phase: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class ProtocolParser {
  
  static parseClaudeProtocol(content: string): ParsedProtocol {
    const phases = this.extractPhases(content);
    const supplements = this.extractSupplements(content);
    const lifestyle = this.extractLifestyle(content);
    const monitoring = this.extractMonitoring(content);
    const timeline = this.extractTimeline(content);
    const coachingNotes = this.extractCoachingNotes(content);

    return {
      phases,
      supplements,
      lifestyle,
      monitoring,
      timeline,
      coachingNotes
    };
  }

  private static extractPhases(content: string): ProtocolPhase[] {
    const phases: ProtocolPhase[] = [];
    
    // Look for phase patterns in Claude analysis
    const phasePatterns = [
      /phase\s*1[:\-\s]*([^#]*?)(?=phase\s*2|$)/gis,
      /phase\s*2[:\-\s]*([^#]*?)(?=phase\s*3|$)/gis,
      /phase\s*3[:\-\s]*([^#]*?)(?=##|$)/gis,
    ];

    phasePatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const phase = this.parsePhaseContent(match, index + 1);
          if (phase) phases.push(phase);
        });
      }
    });

    return phases;
  }

  private static parsePhaseContent(content: string, phaseNumber: number): ProtocolPhase | null {
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      id: randomBytes(8).toString('hex'),
      name: `Phase ${phaseNumber}`,
      duration: this.extractDuration(content) || "30 days",
      goals: this.extractGoals(content),
      supplements: [], // Will be populated separately
      lifestyle: [], // Will be populated separately
      successCriteria: this.extractSuccessCriteria(content),
      nextPhaseConditions: this.extractTransitionConditions(content)
    };
  }

  private static extractSupplements(content: string): SupplementRecommendation[] {
    const supplements: SupplementRecommendation[] = [];
    
    // Look for supplement patterns
    const supplementPatterns = [
      /supplement[s]?[:\-\s]*([^#]*?)(?=##|lifestyle|diet|$)/gis,
      /recommendation[s]?[:\-\s]*([^#]*?)(?=##|lifestyle|diet|$)/gis,
      /protocol[:\-\s]*([^#]*?)(?=##|lifestyle|diet|$)/gis,
    ];

    supplementPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const extractedSupps = this.parseSupplementSection(match);
          supplements.push(...extractedSupps);
        });
      }
    });

    return supplements;
  }

  private static parseSupplementSection(content: string): SupplementRecommendation[] {
    const supplements: SupplementRecommendation[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    lines.forEach(line => {
      // Look for supplement patterns like:
      // - Magnesium Glycinate 400mg before bed (LetsTruck SKU: LT-MAG-400)
      // - Vitamin D3 5000 IU daily (Biotiics alternative available)
      
      const supplementMatch = line.match(/[-•*]\s*([^(]+?)(?:\s*\(([^)]+)\))?$/);
      if (supplementMatch) {
        const [, supplementText, notes] = supplementMatch;
        const supplement = this.parseSupplementLine(supplementText.trim(), notes);
        if (supplement) supplements.push(supplement);
      }
    });

    return supplements;
  }

  private static parseSupplementLine(text: string, notes?: string): SupplementRecommendation | null {
    // Parse supplement name, dosage, timing
    const parts = text.split(/\s+/);
    if (parts.length < 2) return null;

    const name = parts.slice(0, -2).join(' ');
    const dosage = parts[parts.length - 2] || '';
    const timing = parts[parts.length - 1] || '';

    // Extract LetsTruck SKU if mentioned
    const letstruckMatch = notes?.match(/LetsTruck[\s\w]*:?\s*([A-Z0-9-]+)/i);
    const bioticsMatch = notes?.match(/Biotiics[\s\w]*:?\s*([A-Z0-9-]+)/i);
    const fullscriptMatch = notes?.match(/FullScript[\s\w]*:?\s*([^,]+)/i);

    return {
      id: randomBytes(8).toString('hex'),
      name,
      letstruck_sku: letstruckMatch?.[1],
      biotiics_alternative: bioticsMatch?.[1],
      fullscript_backup: fullscriptMatch?.[1],
      dosage,
      timing,
      duration: this.extractDuration(notes || '') || "90 days",
      purpose: this.extractPurpose(notes || ''),
      priority: this.determinePriority(text, notes),
      phase: "1", // Default, will be updated based on context
      trucker_instructions: this.generateTruckerInstructions(name, timing)
    };
  }

  private static extractDuration(text: string): string | null {
    const durationMatch = text.match(/(\d+)\s*(days?|weeks?|months?)/i);
    return durationMatch ? durationMatch[0] : null;
  }

  private static extractGoals(content: string): string[] {
    const goals: string[] = [];
    const goalPatterns = [
      /goals?[:\-\s]*([^#]*?)(?=##|$)/gis,
      /objectives?[:\-\s]*([^#]*?)(?=##|$)/gis,
      /targets?[:\-\s]*([^#]*?)(?=##|$)/gis,
    ];

    goalPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = match.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            const cleaned = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
            if (cleaned.length > 10 && !goals.includes(cleaned)) {
              goals.push(cleaned);
            }
          });
        });
      }
    });

    return goals.slice(0, 5);
  }

  private static extractSuccessCriteria(content: string): string[] {
    const criteria: string[] = [];
    const patterns = [
      /success\s*criteria[:\-\s]*([^#]*?)(?=##|$)/gis,
      /outcomes?[:\-\s]*([^#]*?)(?=##|$)/gis,
      /progress\s*indicators?[:\-\s]*([^#]*?)(?=##|$)/gis,
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = match.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            const cleaned = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
            if (cleaned.length > 10 && !criteria.includes(cleaned)) {
              criteria.push(cleaned);
            }
          });
        });
      }
    });

    return criteria.slice(0, 5);
  }

  private static extractTransitionConditions(content: string): string[] {
    const conditions: string[] = [];
    const patterns = [
      /next\s*phase[:\-\s]*([^#]*?)(?=##|$)/gis,
      /transition[:\-\s]*([^#]*?)(?=##|$)/gis,
      /advance\s*to[:\-\s]*([^#]*?)(?=##|$)/gis,
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = match.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            const cleaned = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
            if (cleaned.length > 10 && !conditions.includes(cleaned)) {
              conditions.push(cleaned);
            }
          });
        });
      }
    });

    return conditions.slice(0, 3);
  }

  private static extractLifestyle(content: string): LifestyleIntervention[] {
    // Implementation for lifestyle interventions
    return [];
  }

  private static extractMonitoring(content: string): MonitoringPlan[] {
    // Implementation for monitoring plans
    return [];
  }

  private static extractTimeline(content: string): ProtocolTimeline {
    return {
      total_duration: "90 days",
      phase_transitions: [],
      follow_up_schedule: []
    };
  }

  private static extractCoachingNotes(content: string): CoachingNote[] {
    // Implementation for coaching notes
    return [];
  }

  private static extractPurpose(text: string): string {
    const purposeMatch = text.match(/for\s+([^,.\n]+)/i);
    return purposeMatch?.[1] || 'General health support';
  }

  private static determinePriority(text: string, notes?: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const highPriorityWords = ['critical', 'essential', 'urgent', 'priority', 'foundation'];
    const lowPriorityWords = ['optional', 'consider', 'if needed', 'supplement'];
    
    const fullText = (text + ' ' + (notes || '')).toLowerCase();
    
    if (highPriorityWords.some(word => fullText.includes(word))) return 'HIGH';
    if (lowPriorityWords.some(word => fullText.includes(word))) return 'LOW';
    return 'MEDIUM';
  }

  private static generateTruckerInstructions(supplement: string, timing: string): string {
    const instructions = {
      'morning': 'Take with breakfast at truck stop or during pre-trip inspection',
      'evening': 'Take before sleep during 10-hour break',
      'before bed': 'Take 30 minutes before sleep during mandatory rest period',
      'with meals': 'Take with meal at truck stop or packed lunch',
      'daily': 'Take at consistent time each day, set phone reminder'
    };

    const timingLower = timing.toLowerCase();
    for (const [key, instruction] of Object.entries(instructions)) {
      if (timingLower.includes(key)) {
        return instruction;
      }
    }

    return 'Follow dosage instructions, maintain consistency while on the road';
  }
}
