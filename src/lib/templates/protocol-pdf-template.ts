import { format } from 'date-fns';

// Protocol data interfaces for PDF generation
export interface PDFProtocolData {
  id: string;
  protocolName: string;
  protocolPhase?: string;
  status: string;
  startDate?: Date;
  durationWeeks?: number;
  greeting?: string;
  clinicalFocus?: string;
  currentStatus?: string;
  protocolNotes?: string;
  effectivenessRating?: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  analysis?: {
    id: string;
    analysisDate: Date;
    analysisVersion: string;
  };
  supplements: Array<{
    id: string;
    productName: string;
    dosage: string;
    timing: string;
    purpose?: string;
    priority: number;
    isActive: boolean;
  }>;
  dailySchedule?: {
    [key: string]: string;
    description?: string;
    notes?: string;
  };
}

// PDF generation options
export interface PDFTemplateOptions {
  paperSize: 'A4' | 'Letter';
  includeGreeting: boolean;
  includeSupplements: boolean;
  includeDietaryGuidelines: boolean;
  includeLifestyleModifications: boolean;
  includeSchedule: boolean;
  brandingConfig?: {
    theme?: string;
    includeClinicLogo?: boolean;
    primaryColor?: string;
    logoUrl?: string;
  };
}

/**
 * Generate base CSS styles for the PDF template
 */
function generateBaseCSS(options: PDFTemplateOptions): string {
  const primaryColor = options.brandingConfig?.primaryColor || '#10b981';

  return `
    <style>
      /* Reset and base styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #1f2937;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* Layout container */
      .pdf-container {
        display: flex;
        min-height: 100vh;
        position: relative;
      }

      /* Green sidebar */
      .sidebar {
        width: 80px;
        background: ${primaryColor};
        background: linear-gradient(135deg, ${primaryColor} 0%, #059669 100%);
        position: relative;
        flex-shrink: 0;
      }

      .sidebar-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-90deg);
        white-space: nowrap;
        color: white;
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      .sidebar::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 1px;
        background: rgba(255, 255, 255, 0.2);
      }

      /* Main content area */
      .main-content {
        flex: 1;
        padding: 40px 50px 60px 50px;
        background: white;
      }

      /* Header section */
      .header {
        margin-bottom: 40px;
        padding-bottom: 25px;
        border-bottom: 2px solid #e5e7eb;
      }

      .protocol-title {
        font-size: 28px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 8px;
        line-height: 1.2;
      }

      .client-info {
        font-size: 16px;
        color: #6b7280;
        margin-bottom: 12px;
      }

      .protocol-meta {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        font-size: 11px;
        color: #6b7280;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .status-active { background: #dcfce7; color: #166534; }
      .status-planned { background: #dbeafe; color: #1d4ed8; }
      .status-completed { background: #f3f4f6; color: #374151; }
      .status-paused { background: #fef3c7; color: #92400e; }

      /* Content sections */
      .section {
        margin-bottom: 35px;
        page-break-inside: avoid;
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-icon {
        width: 20px;
        height: 20px;
        color: ${primaryColor};
      }

      .section-content {
        font-size: 12px;
        line-height: 1.6;
        color: #374151;
      }

      /* Greeting section */
      .greeting {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid ${primaryColor};
        font-style: italic;
        line-height: 1.6;
      }

      /* Clinical focus */
      .clinical-focus {
        background: #fef7cd;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #f59e0b;
      }

      /* Supplement cards */
      .supplements-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .supplement-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 15px;
        position: relative;
        page-break-inside: avoid;
      }

      .supplement-priority {
        position: absolute;
        top: -8px;
        left: 15px;
        background: ${primaryColor};
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 20px;
        text-align: center;
      }

      .supplement-name {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 8px;
        margin-top: 5px;
      }

      .supplement-details {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px 15px;
        font-size: 11px;
        margin-bottom: 10px;
      }

      .supplement-label {
        font-weight: 500;
        color: #6b7280;
      }

      .supplement-value {
        color: #374151;
      }

      .supplement-purpose {
        background: #f3f4f6;
        padding: 8px;
        border-radius: 4px;
        font-size: 10px;
        color: #6b7280;
        font-style: italic;
      }

      /* Daily schedule */
      .schedule-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px 20px;
        align-items: center;
      }

      .schedule-time {
        font-weight: 600;
        color: ${primaryColor};
        font-size: 13px;
        white-space: nowrap;
      }

      .schedule-label {
        color: #374151;
        font-size: 12px;
      }

      /* Notes section */
      .notes {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 20px;
      }

      /* Footer */
      .footer {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 10px;
        color: #9ca3af;
        text-align: center;
        line-height: 1.4;
      }

      /* Print optimizations */
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .pdf-container {
          min-height: auto;
        }
        
        .section {
          page-break-inside: avoid;
        }
        
        .supplement-card {
          page-break-inside: avoid;
        }
      }

      /* Page break utilities */
      .page-break-before {
        page-break-before: always;
      }

      .page-break-after {
        page-break-after: always;
      }

      .no-page-break {
        page-break-inside: avoid;
      }

      /* Responsive adjustments for smaller paper */
      @page {
        margin: 0;
        size: ${options.paperSize};
      }
    </style>
  `;
}

/**
 * Generate HTML content for the protocol PDF
 */
function generateHTMLContent(
  protocol: PDFProtocolData,
  options: PDFTemplateOptions
): string {
  const clientName = `${protocol.client.firstName} ${protocol.client.lastName}`;
  const activeSupplements = protocol.supplements
    .filter(s => s.isActive)
    .sort((a, b) => a.priority - b.priority);

  const scheduleEntries = protocol.dailySchedule
    ? Object.entries(protocol.dailySchedule).filter(
        ([key]) => key !== 'description' && key !== 'notes'
      )
    : [];

  return `
    <div class="pdf-container">
      <!-- Green Sidebar -->
      <div class="sidebar">
        <div class="sidebar-content">
          FUNCTIONAL HEALTH
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <div class="header">
          <h1 class="protocol-title">${protocol.protocolName}</h1>
          <div class="client-info">Prepared for ${clientName}</div>
          <div class="protocol-meta">
            <div class="meta-item">
              <span class="status-badge status-${protocol.status}">${protocol.status}</span>
            </div>
            ${
              protocol.protocolPhase
                ? `
              <div class="meta-item">
                <strong>Phase:</strong> ${protocol.protocolPhase}
              </div>
            `
                : ''
            }
            ${
              protocol.startDate
                ? `
              <div class="meta-item">
                <strong>Start Date:</strong> ${format(protocol.startDate, 'MMMM d, yyyy')}
              </div>
            `
                : ''
            }
            ${
              protocol.durationWeeks
                ? `
              <div class="meta-item">
                <strong>Duration:</strong> ${protocol.durationWeeks} weeks
              </div>
            `
                : ''
            }
            <div class="meta-item">
              <strong>Generated:</strong> ${format(new Date(), 'MMMM d, yyyy')}
            </div>
          </div>
        </div>

        <!-- Greeting Section -->
        ${
          options.includeGreeting && protocol.greeting
            ? `
          <div class="section">
            <h2 class="section-title">
              <span class="section-icon">💌</span>
              Personal Message
            </h2>
            <div class="section-content">
              <div class="greeting">
                ${protocol.greeting.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Clinical Focus -->
        ${
          protocol.clinicalFocus
            ? `
          <div class="section">
            <h2 class="section-title">
              <span class="section-icon">🎯</span>
              Clinical Focus
            </h2>
            <div class="section-content">
              <div class="clinical-focus">
                ${protocol.clinicalFocus.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Priority Supplements -->
        ${
          options.includeSupplements && activeSupplements.length > 0
            ? `
          <div class="section">
            <h2 class="section-title">
              <span class="section-icon">💊</span>
              Priority Supplements (${activeSupplements.length})
            </h2>
            <div class="section-content">
              <div class="supplements-grid">
                ${activeSupplements
                  .map(
                    supplement => `
                  <div class="supplement-card">
                    <div class="supplement-priority">#${supplement.priority}</div>
                    <div class="supplement-name">${supplement.productName}</div>
                    <div class="supplement-details">
                      <div class="supplement-label">Dosage:</div>
                      <div class="supplement-value">${supplement.dosage}</div>
                      <div class="supplement-label">Timing:</div>
                      <div class="supplement-value">${supplement.timing}</div>
                    </div>
                    ${
                      supplement.purpose
                        ? `
                      <div class="supplement-purpose">
                        <strong>Purpose:</strong> ${supplement.purpose}
                      </div>
                    `
                        : ''
                    }
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Daily Schedule -->
        ${
          options.includeSchedule && scheduleEntries.length > 0
            ? `
          <div class="section">
            <h2 class="section-title">
              <span class="section-icon">⏰</span>
              Daily Schedule
            </h2>
            <div class="section-content">
              <div class="schedule-grid">
                ${scheduleEntries
                  .sort(([, timeA], [, timeB]) => {
                    const parseTime = (time: string) => {
                      const [timePart, period] = time.split(' ');
                      let [hours, minutes] = timePart.split(':').map(Number);
                      if (period?.toUpperCase() === 'PM' && hours !== 12)
                        hours += 12;
                      if (period?.toUpperCase() === 'AM' && hours === 12)
                        hours = 0;
                      return hours * 60 + (minutes || 0);
                    };
                    return parseTime(timeA) - parseTime(timeB);
                  })
                  .map(
                    ([key, time]) => `
                    <div class="schedule-time">${time}</div>
                    <div class="schedule-label">${formatScheduleLabel(key)}</div>
                  `
                  )
                  .join('')}
              </div>
              ${
                protocol.dailySchedule?.description
                  ? `
                <div style="margin-top: 15px; font-style: italic; color: #6b7280; font-size: 11px;">
                  ${protocol.dailySchedule.description}
                </div>
              `
                  : ''
              }
            </div>
          </div>
        `
            : ''
        }

        <!-- Protocol Notes -->
        ${
          protocol.protocolNotes
            ? `
          <div class="section">
            <h2 class="section-title">
              <span class="section-icon">📝</span>
              Protocol Notes
            </h2>
            <div class="section-content">
              <div class="notes">
                ${protocol.protocolNotes.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Current Status -->
        ${
          protocol.currentStatus
            ? `
          <div class="section">
            <h2 class="section-title">
              <span class="section-icon">📊</span>
              Current Status
            </h2>
            <div class="section-content">
              ${protocol.currentStatus.replace(/\n/g, '<br>')}
              ${
                protocol.effectivenessRating
                  ? `
                <div style="margin-top: 10px;">
                  <strong>Effectiveness Rating:</strong> 
                  ${'⭐'.repeat(protocol.effectivenessRating)} (${protocol.effectivenessRating}/5)
                </div>
              `
                  : ''
              }
            </div>
          </div>
        `
            : ''
        }

        <!-- Analysis Reference -->
        ${
          protocol.analysis
            ? `
          <div class="section">
            <h2 class="section-title">
              <span class="section-icon">🧠</span>
              Analysis Reference
            </h2>
            <div class="section-content">
              <div style="background: #eff6ff; padding: 12px; border-radius: 6px; border: 1px solid #3b82f6;">
                <div><strong>Version:</strong> ${protocol.analysis.analysisVersion}</div>
                <div><strong>Analysis Date:</strong> ${format(protocol.analysis.analysisDate, 'MMMM d, yyyy')}</div>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Footer -->
        <div class="footer">
          <div>This protocol was generated on ${format(new Date(), 'MMMM d, yyyy')} and is personalized for ${clientName}.</div>
          <div style="margin-top: 8px;">Please consult with your healthcare provider before making any changes to your supplement regimen.</div>
          <div style="margin-top: 8px; font-size: 9px; color: #9ca3af;">
            Generated by FNTP Nutrition System • Protocol ID: ${protocol.id}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format schedule label for display
 */
function formatScheduleLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate complete HTML template for protocol PDF
 */
export function generateProtocolPDFTemplate(
  protocol: PDFProtocolData,
  options: PDFTemplateOptions = {
    paperSize: 'A4',
    includeGreeting: true,
    includeSupplements: true,
    includeDietaryGuidelines: true,
    includeLifestyleModifications: true,
    includeSchedule: true,
  }
): string {
  const css = generateBaseCSS(options);
  const htmlContent = generateHTMLContent(protocol, options);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${protocol.protocolName} - ${protocol.client.firstName} ${protocol.client.lastName}</title>
      ${css}
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
}

/**
 * Generate default PDF template options
 */
export function getDefaultTemplateOptions(): PDFTemplateOptions {
  return {
    paperSize: 'A4',
    includeGreeting: true,
    includeSupplements: true,
    includeDietaryGuidelines: true,
    includeLifestyleModifications: true,
    includeSchedule: true,
    brandingConfig: {
      theme: 'professional',
      includeClinicLogo: false,
      primaryColor: '#10b981',
    },
  };
}

/**
 * Validate protocol data for PDF generation
 */
export function validateProtocolData(protocol: PDFProtocolData): string[] {
  const errors: string[] = [];

  if (!protocol.id) errors.push('Protocol ID is required');
  if (!protocol.protocolName) errors.push('Protocol name is required');
  if (!protocol.client?.firstName) errors.push('Client first name is required');
  if (!protocol.client?.lastName) errors.push('Client last name is required');

  return errors;
}
