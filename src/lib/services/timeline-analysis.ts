/**
 * Timeline Analysis Service
 *
 * Processes client health data into chronological timeline format
 * optimized for Claude Desktop protocol generation workflow.
 *
 * Features:
 * - Comprehensive health journey aggregation
 * - Critical findings identification
 * - Markdown generation for Claude Desktop
 * - Multiple timeline types (comprehensive, focused, symptoms, etc.)
 */

import { prisma } from '@/lib/db';
import type { TimelineType } from '@prisma/client';
import { ProtocolTimelineGenerator } from './protocol-timeline-generator';
import {
  functionalMedicineLabAnalysis,
  type LabAnalysisReport,
} from './functional-medicine-lab-analysis';
import {
  functionalMedicineAssessmentAnalysis,
  type AssessmentAnalysisReport,
} from './functional-medicine-assessment-analysis';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'assessment' | 'document' | 'note' | 'protocol' | 'status_change';
  category: string;
  title: string;
  description: string;
  severity?: 'low' | 'moderate' | 'high' | 'critical';
  findings?: any;
  metadata?: Record<string, any>;
}

interface CriticalFinding {
  id: string;
  category: 'symptom' | 'biomarker' | 'trend' | 'risk_factor';
  severity: 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  firstObserved: Date;
  lastObserved: Date;
  frequency: number;
  trend?: 'improving' | 'worsening' | 'stable';
  relatedEvents: string[];
}

interface TimelineOptions {
  includeAssessments?: boolean;
  includeDocuments?: boolean;
  includeMedicalDocuments?: boolean;
  includeNotes?: boolean;
  includeProtocols?: boolean;
  includeStatusChanges?: boolean;
  includeAIAnalyses?: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

interface TimelineAnalysis {
  clientId: string;
  clientName: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  totalEvents: number;
  events: TimelineEvent[];
  criticalFindings: CriticalFinding[];
  healthPhases: {
    phase: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    keyEvents: string[];
  }[];
  // Enhanced lab analysis
  labAnalysis?: LabAnalysisReport;
  // Enhanced assessment analysis
  assessmentAnalysis?: AssessmentAnalysisReport;
  analysisVersion: string;
  generatedAt: Date;
  dataSourcesIncluded: string[];
}

export class TimelineAnalysisService {
  /**
   * Generate comprehensive timeline analysis for a client
   */
  static async generateTimelineAnalysis(
    clientId: string,
    timelineType: TimelineType = 'COMPREHENSIVE',
    options: TimelineOptions = {}
  ): Promise<TimelineAnalysis> {
    const startTime = Date.now();

    try {
      // Fetch all client data with relationships
      const clientData = await this.fetchClientData(clientId);

      if (!clientData) {
        throw new Error(`Client not found: ${clientId}`);
      }

      // Handle protocol development timeline type with specialized generator
      if (timelineType === 'PROTOCOL_DEVELOPMENT') {
        return await this.generateProtocolDevelopmentAnalysis(
          clientData,
          options
        );
      }

      // Extract timeline events from all data sources
      const events = await this.extractTimelineEvents(
        clientData,
        timelineType,
        options
      );

      // Identify critical findings and patterns
      const criticalFindings = await this.identifyCriticalFindings(events);

      // Identify health phases and transitions
      const healthPhases = await this.identifyHealthPhases(
        events,
        criticalFindings
      );

      // Generate enhanced lab analysis if medical documents included
      let labAnalysis: LabAnalysisReport | undefined;
      if (
        options.includeMedicalDocuments !== false &&
        clientData.medicalDocuments
      ) {
        const labResults = this.extractLabResults(clientData.medicalDocuments);
        if (labResults.length > 0) {
          labAnalysis =
            await functionalMedicineLabAnalysis.generateEnhancedLabAnalysis(
              labResults
            );
          console.log(
            `🔬 Generated functional medicine lab analysis for ${labResults.length} lab values`
          );
        }
      }

      // Generate enhanced assessment analysis if assessments included
      let assessmentAnalysis: AssessmentAnalysisReport | undefined;
      if (
        options.includeAssessments !== false &&
        clientData.simpleAssessments
      ) {
        if (clientData.simpleAssessments.length > 0) {
          assessmentAnalysis =
            await functionalMedicineAssessmentAnalysis.generateEnhancedAssessmentAnalysis(
              clientData.simpleAssessments
            );
          console.log(
            `🎯 Generated functional medicine assessment analysis for ${clientData.simpleAssessments.length} assessments`
          );
        }
      }

      // Track which data sources were included
      const dataSourcesIncluded = [];
      if (options.includeAssessments !== false)
        dataSourcesIncluded.push('Assessments');
      if (options.includeDocuments !== false)
        dataSourcesIncluded.push('Documents');
      if (options.includeMedicalDocuments !== false)
        dataSourcesIncluded.push('Medical Documents');
      if (options.includeNotes !== false)
        dataSourcesIncluded.push('Clinical Notes');
      if (options.includeProtocols !== false)
        dataSourcesIncluded.push('Protocols');
      if (options.includeStatusChanges !== false)
        dataSourcesIncluded.push('Status Changes');
      if (options.includeAIAnalyses !== false)
        dataSourcesIncluded.push('AI Analyses');

      const analysis: TimelineAnalysis = {
        clientId,
        clientName: `${clientData.firstName} ${clientData.lastName}`,
        dateRange: {
          startDate: events.length > 0 ? events[0].date : new Date(),
          endDate:
            events.length > 0 ? events[events.length - 1].date : new Date(),
        },
        totalEvents: events.length,
        events: events.sort((a, b) => a.date.getTime() - b.date.getTime()),
        criticalFindings,
        healthPhases,
        labAnalysis, // Enhanced functional medicine lab analysis
        assessmentAnalysis, // Enhanced functional medicine assessment analysis
        analysisVersion:
          assessmentAnalysis && labAnalysis
            ? 'v3.0-comprehensive-enhanced'
            : assessmentAnalysis
              ? 'v3.0-assessment-enhanced'
              : labAnalysis
                ? 'v2.0-lab-enhanced'
                : 'v1.0',
        generatedAt: new Date(),
        dataSourcesIncluded,
      };

      console.log(
        `Timeline analysis generated in ${
          Date.now() - startTime
        }ms for client ${clientId}`
      );

      return analysis;
    } catch (error) {
      console.error('Timeline analysis generation failed:', error);
      throw new Error(
        `Failed to generate timeline analysis: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Generate protocol development focused analysis using specialized generator
   */
  private static async generateProtocolDevelopmentAnalysis(
    clientData: any,
    options: TimelineOptions = {}
  ): Promise<TimelineAnalysis> {
    // Convert client data to format expected by ProtocolTimelineGenerator
    const timelineData = {
      client: clientData,
      assessments: clientData.simpleAssessments || [],
      labResults: this.extractLabResults(clientData.medicalDocuments || []),
      protocols: [
        ...(clientData.protocols || []),
        ...(clientData.enhancedProtocols || []),
      ],
      clinicalNotes: clientData.notes || [],
      medicalDocuments: clientData.medicalDocuments || [],
      statusChanges: clientData.statuses || [],
      aiAnalyses: clientData.clientAnalyses || [],
    };

    // Apply date range filtering if specified
    if (options.dateRange) {
      timelineData.assessments = this.filterByDateRange(
        timelineData.assessments,
        options.dateRange,
        'startedAt'
      );
      timelineData.protocols = this.filterByDateRange(
        timelineData.protocols,
        options.dateRange,
        'createdAt'
      );
      timelineData.clinicalNotes = this.filterByDateRange(
        timelineData.clinicalNotes,
        options.dateRange,
        'createdAt'
      );
      timelineData.statusChanges = this.filterByDateRange(
        timelineData.statusChanges,
        options.dateRange,
        'createdAt'
      );
      timelineData.aiAnalyses = this.filterByDateRange(
        timelineData.aiAnalyses,
        options.dateRange,
        'analysisDate'
      );
      timelineData.medicalDocuments = this.filterByDateRange(
        timelineData.medicalDocuments,
        options.dateRange,
        'uploadDate'
      );
    }

    // Apply granular filtering
    if (options.includeAssessments === false) timelineData.assessments = [];
    if (options.includeDocuments === false) timelineData.medicalDocuments = [];
    if (options.includeMedicalDocuments === false) {
      timelineData.medicalDocuments = [];
      timelineData.labResults = [];
    }
    if (options.includeNotes === false) timelineData.clinicalNotes = [];
    if (options.includeProtocols === false) timelineData.protocols = [];
    if (options.includeStatusChanges === false) timelineData.statusChanges = [];
    if (options.includeAIAnalyses === false) timelineData.aiAnalyses = [];

    // Generate protocol-focused markdown
    const protocolMarkdown =
      ProtocolTimelineGenerator.generateProtocolTimelineAnalysis(timelineData);

    // Track data sources
    const dataSourcesIncluded = [];
    if (timelineData.assessments.length > 0)
      dataSourcesIncluded.push('Assessments');
    if (timelineData.medicalDocuments.length > 0)
      dataSourcesIncluded.push('Medical Documents');
    if (timelineData.labResults.length > 0)
      dataSourcesIncluded.push('Lab Results');
    if (timelineData.clinicalNotes.length > 0)
      dataSourcesIncluded.push('Clinical Notes');
    if (timelineData.protocols.length > 0)
      dataSourcesIncluded.push('Protocols');
    if (timelineData.statusChanges.length > 0)
      dataSourcesIncluded.push('Status Changes');
    if (timelineData.aiAnalyses.length > 0)
      dataSourcesIncluded.push('AI Analyses');

    // Return in TimelineAnalysis format for consistency
    return {
      clientId: clientData.id,
      clientName: `${clientData.firstName} ${clientData.lastName}`,
      dateRange: {
        startDate:
          options.dateRange?.startDate ||
          new Date(Math.min(...this.getAllDates(timelineData))),
        endDate:
          options.dateRange?.endDate ||
          new Date(Math.max(...this.getAllDates(timelineData))),
      },
      totalEvents: this.countTotalEvents(timelineData),
      events: [], // Protocol development doesn't use standard events format
      criticalFindings: [], // Handled within protocol markdown
      healthPhases: [], // Handled within protocol markdown
      analysisVersion: 'v2.0-protocol-development',
      generatedAt: new Date(),
      dataSourcesIncluded,
      protocolMarkdown, // Add the generated protocol markdown
    } as TimelineAnalysis & { protocolMarkdown: string };
  }

  /**
   * Extract lab results from medical documents
   */
  private static extractLabResults(medicalDocuments: any[]): any[] {
    return medicalDocuments.flatMap(doc =>
      (doc.labValues || []).map((lab: any) => ({
        ...lab,
        testDate: lab.collectionDate || doc.uploadDate,
      }))
    );
  }

  /**
   * Filter array by date range
   */
  private static filterByDateRange(
    items: any[],
    dateRange: { startDate: Date; endDate: Date },
    dateField: string
  ): any[] {
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    });
  }

  /**
   * Get all dates from timeline data for range calculation
   */
  private static getAllDates(data: any): number[] {
    const dates = [];

    data.assessments.forEach((item: any) =>
      dates.push(new Date(item.startedAt).getTime())
    );
    data.protocols.forEach((item: any) =>
      dates.push(new Date(item.createdAt).getTime())
    );
    data.clinicalNotes.forEach((item: any) =>
      dates.push(new Date(item.createdAt).getTime())
    );
    data.statusChanges.forEach((item: any) =>
      dates.push(new Date(item.createdAt).getTime())
    );
    data.aiAnalyses.forEach((item: any) =>
      dates.push(new Date(item.analysisDate).getTime())
    );
    data.medicalDocuments.forEach((item: any) =>
      dates.push(new Date(item.uploadDate).getTime())
    );

    return dates.length > 0 ? dates : [Date.now()];
  }

  /**
   * Count total events across all data sources
   */
  private static countTotalEvents(data: any): number {
    return (
      data.assessments.length +
      data.protocols.length +
      data.clinicalNotes.length +
      data.statusChanges.length +
      data.aiAnalyses.length +
      data.medicalDocuments.length
    );
  }

  /**
   * Fetch comprehensive client data with all relationships
   */
  private static async fetchClientData(clientId: string) {
    return await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        // Assessment data
        simpleAssessments: {
          include: {
            responses: true,
          },
          orderBy: { startedAt: 'asc' },
        },

        // Documents and analysis
        documents: {
          orderBy: { uploadedAt: 'asc' },
        },
        medicalDocuments: {
          include: {
            analysis: true,
            labValues: true,
          },
          orderBy: { uploadDate: 'asc' },
        },

        // Notes (clinical observations)
        notes: {
          orderBy: { createdAt: 'asc' },
        },

        // Status changes
        statuses: {
          orderBy: { createdAt: 'asc' },
        },

        // Protocols and treatments
        protocols: {
          orderBy: { createdAt: 'asc' },
        },
        enhancedProtocols: {
          include: {
            protocolSupplements: true,
          },
          orderBy: { createdAt: 'asc' },
        },

        // AI analyses
        clientAnalyses: {
          orderBy: { analysisDate: 'asc' },
        },
      },
    });
  }

  /**
   * Extract timeline events from all client data sources
   */
  private static async extractTimelineEvents(
    clientData: any,
    timelineType: TimelineType,
    options: TimelineOptions = {}
  ): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    // Date filtering helper
    const isInDateRange = (date: Date) => {
      if (options.dateRange?.startDate && date < options.dateRange.startDate) {
        return false;
      }
      if (options.dateRange?.endDate && date > options.dateRange.endDate) {
        return false;
      }
      return true;
    };

    // Assessment events
    if (options.includeAssessments !== false) {
      for (const assessment of clientData.simpleAssessments || []) {
        if (!isInDateRange(assessment.startedAt)) continue;
        events.push({
          id: `assessment-${assessment.id}`,
          date: assessment.startedAt,
          type: 'assessment',
          category: 'Health Assessment',
          title: `${
            assessment.status === 'completed' ? 'Completed' : 'Started'
          } Health Assessment`,
          description: `Assessment ${assessment.status} with ${
            assessment.responses?.length || 0
          } responses`,
          findings: {
            responseCount: assessment.responses?.length || 0,
            status: assessment.status,
            completedAt: assessment.completedAt,
          },
          metadata: {
            assessmentId: assessment.id,
            responseData: assessment.responses || [],
          },
        });
      }
    }

    // Document events
    if (options.includeDocuments !== false) {
      for (const doc of clientData.documents || []) {
        if (!isInDateRange(doc.uploadedAt)) continue;
        events.push({
          id: `document-${doc.id}`,
          date: doc.uploadedAt,
          type: 'document',
          category: doc.documentType || 'Unknown Document',
          title: `Document Uploaded: ${doc.fileName}`,
          description: `${
            doc.documentType || 'Document'
          } uploaded - ${this.formatFileSize(doc.fileSize)}`,
          severity: doc.analysisStatus === 'FAILED' ? 'high' : 'low',
          findings: {
            documentType: doc.documentType,
            analysisStatus: doc.analysisStatus,
            ocrConfidence: doc.ocrConfidence,
            containsPHI: doc.containsPHI,
          },
          metadata: {
            documentId: doc.id,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
          },
        });
      }
    }

    // Medical document events (lab results, etc.)
    if (options.includeMedicalDocuments !== false) {
      for (const medDoc of clientData.medicalDocuments || []) {
        if (!isInDateRange(medDoc.uploadDate)) continue;
        const labValueCount = medDoc.labValues?.length || 0;
        events.push({
          id: `medical-${medDoc.id}`,
          date: medDoc.uploadDate,
          type: 'document',
          category: 'Medical Document',
          title: `Lab Results: ${medDoc.originalFileName}`,
          description: `${medDoc.documentType} processed - ${labValueCount} lab values extracted`,
          severity:
            medDoc.status === 'FAILED'
              ? 'high'
              : labValueCount > 0
                ? 'moderate'
                : 'low',
          findings: {
            status: medDoc.status,
            labValueCount,
            ocrConfidence: medDoc.ocrConfidence,
            hasAnalysis: !!medDoc.analysis,
          },
          metadata: {
            documentId: medDoc.id,
            labValues: medDoc.labValues || [],
            analysis: medDoc.analysis,
          },
        });
      }
    }

    // Clinical notes events
    if (options.includeNotes !== false) {
      for (const note of clientData.notes || []) {
        if (!isInDateRange(note.createdAt)) continue;
        events.push({
          id: `note-${note.id}`,
          date: note.createdAt,
          type: 'note',
          category: `${note.noteType} Note`,
          title: note.title || `${note.noteType} Session`,
          description: this.extractNoteDescription(note),
          severity: note.isImportant
            ? 'high'
            : note.followUpNeeded
              ? 'moderate'
              : 'low',
          findings: {
            noteType: note.noteType,
            isImportant: note.isImportant,
            followUpNeeded: note.followUpNeeded,
            hasComplaints: !!note.chiefComplaints,
            hasGoals: !!note.goals,
          },
          metadata: {
            noteId: note.id,
            fullNote: note,
          },
        });
      }
    }

    // Status change events
    if (options.includeStatusChanges !== false) {
      for (const status of clientData.statuses || []) {
        if (!isInDateRange(status.createdAt)) continue;
        events.push({
          id: `status-${status.id}`,
          date: status.createdAt,
          type: 'status_change',
          category: 'Status Update',
          title: `Status: ${status.status.replace('_', ' ').toLowerCase()}`,
          description:
            status.notes || `Client status changed to ${status.status}`,
          severity: this.getStatusSeverity(status.status),
          findings: {
            previousStatus: null, // Could be enhanced to track previous status
            newStatus: status.status,
            hasNotes: !!status.notes,
          },
          metadata: {
            statusId: status.id,
            createdBy: status.createdBy,
          },
        });
      }
    }

    // Protocol events
    if (options.includeProtocols !== false) {
      for (const protocol of clientData.protocols || []) {
        if (!isInDateRange(protocol.createdAt)) continue;
        events.push({
          id: `protocol-${protocol.id}`,
          date: protocol.createdAt,
          type: 'protocol',
          category: 'Treatment Protocol',
          title: protocol.protocolName,
          description: `Protocol ${protocol.status} - ${
            Object.keys(protocol.supplements || {}).length
          } supplements`,
          severity: protocol.status === 'active' ? 'moderate' : 'low',
          findings: {
            status: protocol.status,
            supplementCount: Object.keys(protocol.supplements || {}).length,
            hasDietary: !!protocol.dietary,
            hasLifestyle: !!protocol.lifestyle,
          },
          metadata: {
            protocolId: protocol.id,
            fullProtocol: protocol,
          },
        });
      }

      // Enhanced protocol events
      for (const enhProtocol of clientData.enhancedProtocols || []) {
        if (!isInDateRange(enhProtocol.createdAt)) continue;
        const supplementCount = enhProtocol.protocolSupplements?.length || 0;
        events.push({
          id: `enhanced-protocol-${enhProtocol.id}`,
          date: enhProtocol.createdAt,
          type: 'protocol',
          category: 'Enhanced Protocol',
          title: enhProtocol.protocolName,
          description: `${
            enhProtocol.protocolPhase || 'Protocol'
          } - ${supplementCount} supplements`,
          severity: enhProtocol.currentStatus === 'active' ? 'moderate' : 'low',
          findings: {
            status: enhProtocol.currentStatus,
            phase: enhProtocol.protocolPhase,
            supplementCount,
            effectivenessRating: enhProtocol.effectivenessRating,
          },
          metadata: {
            protocolId: enhProtocol.id,
            supplements: enhProtocol.protocolSupplements || [],
          },
        });
      }
    }

    // AI analysis events
    if (options.includeAIAnalyses !== false) {
      for (const analysis of clientData.clientAnalyses || []) {
        if (!isInDateRange(analysis.analysisDate)) continue;
        events.push({
          id: `analysis-${analysis.id}`,
          date: analysis.analysisDate,
          type: 'assessment',
          category: 'AI Analysis',
          title: `AI Health Analysis (${analysis.analysisVersion})`,
          description:
            analysis.executiveSummary ||
            'Comprehensive AI health analysis completed',
          severity: 'high',
          findings: {
            version: analysis.analysisVersion,
            status: analysis.status,
            hasExecutiveSummary: !!analysis.executiveSummary,
            hasRootCause: !!analysis.rootCauseAnalysis,
            hasRecommendations: !!analysis.protocolRecommendations,
          },
          metadata: {
            analysisId: analysis.id,
            fullAnalysis: analysis.fullAnalysis,
          },
        });
      }
    }

    return events.filter(event => this.shouldIncludeEvent(event, timelineType));
  }

  /**
   * Determine if event should be included based on timeline type
   */
  private static shouldIncludeEvent(
    event: TimelineEvent,
    timelineType: TimelineType
  ): boolean {
    switch (timelineType) {
      case 'FOCUSED':
        return (
          event.severity === 'high' ||
          event.severity === 'critical' ||
          event.type === 'protocol' ||
          event.type === 'assessment'
        );

      case 'SYMPTOMS':
        return (
          event.category.toLowerCase().includes('symptom') ||
          event.description.toLowerCase().includes('symptom') ||
          event.type === 'note'
        );

      case 'TREATMENTS':
        return (
          event.type === 'protocol' ||
          event.category.toLowerCase().includes('treatment') ||
          event.category.toLowerCase().includes('protocol')
        );

      case 'ASSESSMENTS':
        return (
          event.type === 'assessment' ||
          event.category.toLowerCase().includes('analysis') ||
          event.category.toLowerCase().includes('assessment')
        );

      case 'PROTOCOL_DEVELOPMENT':
        // For protocol development, include all relevant data for comprehensive analysis
        return true;

      case 'COMPREHENSIVE':
      default:
        return true;
    }
  }

  /**
   * Identify critical findings and health patterns
   */
  private static async identifyCriticalFindings(
    events: TimelineEvent[]
  ): Promise<CriticalFinding[]> {
    const findings: CriticalFinding[] = [];

    // Group events by category for pattern analysis
    const eventsByCategory = this.groupEventsByCategory(events);

    for (const [category, categoryEvents] of Object.entries(eventsByCategory)) {
      // Look for recurring issues
      if (categoryEvents.length >= 3) {
        const firstEvent = categoryEvents[0];
        const lastEvent = categoryEvents[categoryEvents.length - 1];

        findings.push({
          id: `pattern-${category.toLowerCase().replace(/\s+/g, '-')}`,
          category: 'trend',
          severity: 'moderate',
          title: `Recurring ${category} Issues`,
          description: `Multiple ${category.toLowerCase()} events observed over time`,
          firstObserved: firstEvent.date,
          lastObserved: lastEvent.date,
          frequency: categoryEvents.length,
          trend: this.determineTrend(categoryEvents),
          relatedEvents: categoryEvents.map(e => e.id),
        });
      }
    }

    // Identify high-severity events as critical findings
    const highSeverityEvents = events.filter(
      e => e.severity === 'high' || e.severity === 'critical'
    );
    for (const event of highSeverityEvents) {
      findings.push({
        id: `critical-${event.id}`,
        category: 'risk_factor',
        severity: event.severity === 'critical' ? 'critical' : 'high',
        title: event.title,
        description: event.description,
        firstObserved: event.date,
        lastObserved: event.date,
        frequency: 1,
        relatedEvents: [event.id],
      });
    }

    return findings.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, moderate: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Identify distinct health phases in the timeline
   */
  private static async identifyHealthPhases(
    events: TimelineEvent[],
    criticalFindings: CriticalFinding[]
  ): Promise<any[]> {
    const phases = [];

    if (events.length === 0) return phases;

    // Simple phase identification based on major events
    const majorEvents = events.filter(
      e =>
        e.type === 'protocol' ||
        e.type === 'assessment' ||
        e.severity === 'high' ||
        e.severity === 'critical'
    );

    if (majorEvents.length > 0) {
      phases.push({
        phase: 'Initial Assessment',
        startDate: events[0].date,
        endDate: majorEvents[0]?.date,
        description: 'Initial health assessment and data collection phase',
        keyEvents: events.slice(0, 3).map(e => e.id),
      });

      if (majorEvents.length > 1) {
        phases.push({
          phase: 'Active Treatment',
          startDate: majorEvents[0].date,
          endDate: majorEvents[majorEvents.length - 1].date,
          description: 'Treatment protocol implementation and monitoring',
          keyEvents: majorEvents.map(e => e.id),
        });
      }

      if (events.length > majorEvents.length) {
        phases.push({
          phase: 'Ongoing Monitoring',
          startDate:
            majorEvents[majorEvents.length - 1]?.date || events[0].date,
          description: 'Continued monitoring and protocol adjustments',
          keyEvents: events.slice(-3).map(e => e.id),
        });
      }
    }

    return phases;
  }

  /**
   * Helper methods
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private static extractNoteDescription(note: any): string {
    const parts = [];
    if (note.chiefComplaints)
      parts.push(`Chief Complaints: ${note.chiefComplaints.slice(0, 100)}`);
    if (note.goals) parts.push(`Goals: ${note.goals.slice(0, 100)}`);
    if (note.generalNotes) parts.push(note.generalNotes.slice(0, 100));

    return parts.join(' | ') || 'Clinical note recorded';
  }

  private static getStatusSeverity(
    status: string
  ): 'low' | 'moderate' | 'high' | 'critical' {
    const highSeverityStatuses = ['DOCS_UPLOADED', 'SCHEDULED', 'ONGOING'];
    const moderateSeverityStatuses = [
      'ASSESSMENT_COMPLETED',
      'INITIAL_INTERVIEW_COMPLETED',
    ];

    if (highSeverityStatuses.includes(status)) return 'high';
    if (moderateSeverityStatuses.includes(status)) return 'moderate';
    return 'low';
  }

  private static groupEventsByCategory(
    events: TimelineEvent[]
  ): Record<string, TimelineEvent[]> {
    return events.reduce(
      (groups, event) => {
        const category = event.category;
        if (!groups[category]) groups[category] = [];
        groups[category].push(event);
        return groups;
      },
      {} as Record<string, TimelineEvent[]>
    );
  }

  private static determineTrend(
    events: TimelineEvent[]
  ): 'improving' | 'worsening' | 'stable' {
    if (events.length < 2) return 'stable';

    // Simple trend analysis based on event severity over time
    const recentEvents = events.slice(-3);
    const olderEvents = events.slice(0, 3);

    const recentSeverityScore =
      recentEvents.reduce((score, event) => {
        const severityScores = { low: 1, moderate: 2, high: 3, critical: 4 };
        return score + (severityScores[event.severity || 'low'] || 1);
      }, 0) / recentEvents.length;

    const olderSeverityScore =
      olderEvents.reduce((score, event) => {
        const severityScores = { low: 1, moderate: 2, high: 3, critical: 4 };
        return score + (severityScores[event.severity || 'low'] || 1);
      }, 0) / olderEvents.length;

    if (recentSeverityScore < olderSeverityScore - 0.5) return 'improving';
    if (recentSeverityScore > olderSeverityScore + 0.5) return 'worsening';
    return 'stable';
  }
}
