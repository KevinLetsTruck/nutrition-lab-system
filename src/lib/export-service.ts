import { ReportData } from '@/components/reports/PractitionerAnalysis'

export async function exportToPDF(report: ReportData, mode: 'full' | 'coaching'): Promise<void> {
  try {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Failed to open print window')
    }

    // Generate the HTML content for the PDF
    const htmlContent = generatePDFHTML(report, mode)
    
    // Write the content to the new window
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  } catch (error) {
    console.error('Error exporting PDF:', error)
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function generatePDFHTML(report: ReportData, mode: 'full' | 'coaching'): string {
  const isCoachingMode = mode === 'coaching'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Practitioner Analysis Report - ${report.client.name}</title>
    <style>
        @media print {
            body { margin: 0; padding: 20px; }
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: ${isCoachingMode ? '32px' : '28px'};
        }
        
        .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: ${isCoachingMode ? '18px' : '16px'};
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: ${isCoachingMode ? '24px' : '20px'};
        }
        
        .section h3 {
            color: #374151;
            margin: 20px 0 10px 0;
            font-size: ${isCoachingMode ? '20px' : '18px'};
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            background: #f9fafb;
        }
        
        .card h4 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: ${isCoachingMode ? '18px' : '16px'};
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 8px;
        }
        
        .badge-primary { background: #dbeafe; color: #1e40af; }
        .badge-secondary { background: #e5e7eb; color: #374151; }
        .badge-destructive { background: #fee2e2; color: #dc2626; }
        
        .supplement {
            border-left: 4px solid #2563eb;
            padding: 10px;
            margin: 10px 0;
            background: #f8fafc;
        }
        
        .supplement h5 {
            margin: 0 0 5px 0;
            color: #1e40af;
        }
        
        .supplement p {
            margin: 5px 0;
            font-size: 14px;
        }
        
        .highlight {
            background: #fef3c7;
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        .truck-driver {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .truck-driver h4 {
            color: #d97706;
            margin: 0 0 10px 0;
        }
        
        ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        li {
            margin: 5px 0;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        
        @media print {
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Practitioner Analysis Report</h1>
        <p><strong>${report.client.name}</strong> • Session: ${new Date().toLocaleDateString()}</p>
        <p>Generated: ${report.version.generatedAt.toLocaleDateString()} • ${report.version.generatedBy === 'ai' ? 'AI Generated' : 'Manual'}</p>
        ${report.client.truckDriver ? '<p><strong>🚛 Truck Driver Client</strong></p>' : ''}
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        
        <div class="grid">
            <div class="card">
                <h4>Primary Health Concerns</h4>
                ${Object.entries(report.nutriqData.bodySystems)
                  .sort(([,a], [,b]) => b.score - a.score)
                  .slice(0, 3)
                  .map(([system, data]) => `
                    <div>
                        <span class="badge ${data.score >= 7 ? 'badge-destructive' : data.score >= 5 ? 'badge-secondary' : 'badge-primary'}">
                            ${system}: ${data.score}/10
                        </span>
                    </div>
                  `).join('')}
            </div>
            
            <div class="card">
                <h4>Progress & Compliance</h4>
                ${report.protocols.find(p => p.status === 'active') 
                  ? `<p>Active Protocol: ${report.protocols.find(p => p.status === 'active')?.phase}</p>
                     <p>Compliance: ${report.protocols.find(p => p.status === 'active')?.compliance || 0}%</p>`
                  : '<p>No active protocol</p>'
                }
            </div>
        </div>
        
        ${report.analysis?.rootCauses ? `
        <div class="card">
            <h4>Root Causes</h4>
            <ul>
                ${report.analysis.rootCauses.map(cause => `<li>${cause}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>

    <div class="section page-break">
        <h2>Comprehensive Data Analysis</h2>
        
        <h3>NutriQ Assessment Summary</h3>
        <div class="grid">
            ${Object.entries(report.nutriqData.bodySystems).map(([system, data]) => `
                <div class="card">
                    <h4>${system.charAt(0).toUpperCase() + system.slice(1)}</h4>
                    <span class="badge ${data.score >= 7 ? 'badge-destructive' : data.score >= 5 ? 'badge-secondary' : 'badge-primary'}">
                        ${data.score}/10
                    </span>
                    ${data.issues.length > 0 ? `<p><strong>Issues:</strong> ${data.issues.slice(0, 2).join(', ')}</p>` : ''}
                </div>
            `).join('')}
        </div>
        
        ${report.labData.length > 0 ? `
        <h3>Lab Findings</h3>
        ${report.labData.map(lab => `
            <div class="card">
                <h4>${lab.reportType.toUpperCase()} - ${lab.reportDate}</h4>
                <p><strong>Status:</strong> ${lab.status}</p>
                ${lab.notes ? `<p><strong>Notes:</strong> ${lab.notes}</p>` : ''}
            </div>
        `).join('')}
        ` : ''}
    </div>

    ${report.analysis?.systemInterconnections ? `
    <div class="section">
        <h2>Clinical Insights</h2>
        
        <h3>System Interconnections</h3>
        <ul>
            ${report.analysis.systemInterconnections.map(interconnection => `<li>${interconnection}</li>`).join('')}
        </ul>
        
        ${report.client.truckDriver ? `
        <div class="truck-driver">
            <h4>🚛 Truck Driver Considerations</h4>
            <ul>
                ${report.analysis.truckDriverConsiderations.map(consideration => `<li>${consideration}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
    ` : ''}

    ${report.analysis?.interventionProtocol ? `
    <div class="section page-break">
        <h2>Intervention Protocol</h2>
        
        <h3>Immediate Actions (Week 1-2)</h3>
        
        ${report.analysis.interventionProtocol.immediate.supplements.length > 0 ? `
        <h4>Priority Supplements</h4>
        ${report.analysis.interventionProtocol.immediate.supplements.map(supplement => `
            <div class="supplement">
                <h5>${supplement.product}</h5>
                <p><strong>Dosage:</strong> ${supplement.dosage} • <strong>Timing:</strong> ${supplement.timing} • <strong>Duration:</strong> ${supplement.duration}</p>
                <p><strong>Source:</strong> ${supplement.source === 'letstruck' ? 'Letstruck.com' : supplement.source === 'biotics' ? 'Biotics Research' : 'Fullscript'}</p>
                ${supplement.truckCompatible ? '<p><strong>🚛 Truck Compatible</strong></p>' : ''}
                ${supplement.notes ? `<p><strong>Notes:</strong> ${supplement.notes}</p>` : ''}
            </div>
        `).join('')}
        ` : ''}
        
        ${report.analysis.interventionProtocol.immediate.dietary.length > 0 ? `
        <h4>Dietary Modifications</h4>
        <ul>
            ${report.analysis.interventionProtocol.immediate.dietary.map(item => `<li>${item}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${report.analysis.interventionProtocol.immediate.lifestyle.length > 0 ? `
        <h4>Lifestyle Modifications</h4>
        <ul>
            ${report.analysis.interventionProtocol.immediate.lifestyle.map(item => `<li>${item}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${report.analysis.interventionProtocol.truckDriverMods.length > 0 ? `
        <div class="truck-driver">
            <h4>Truck Driver Modifications</h4>
            <ul>
                ${report.analysis.interventionProtocol.truckDriverMods.map(mod => `<li>${mod}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${report.analysis.expectedTimeline ? `
        <h3>Expected Timeline</h3>
        <p>${report.analysis.expectedTimeline}</p>
        ` : ''}
        
        ${report.analysis.complianceStrategies.length > 0 ? `
        <h3>Compliance Strategies</h3>
        <ul>
            ${report.analysis.complianceStrategies.map(strategy => `<li>${strategy}</li>`).join('')}
        </ul>
        ` : ''}
    </div>
    ` : ''}

    <div class="footer">
        <p>Generated by Nutrition Lab System • ${new Date().toLocaleDateString()}</p>
        <p>Confidential - For Practitioner Use Only</p>
    </div>
</body>
</html>
  `
} 