'use client'

import React from 'react'
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
} from 'chart.js'
import { Radar, Bar, Doughnut } from 'react-chartjs-2'
import { NAQPattern, SymptomBurdenData } from '@/lib/analysis/naq-pattern-analyzer'

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
)

interface NAQReportVisualsProps {
  data: SymptomBurdenData
  patterns: NAQPattern[]
}

export const NAQReportVisuals: React.FC<NAQReportVisualsProps> = ({ data, patterns }) => {
  return (
    <div className="space-y-8 print:space-y-6">
      {/* Symptom Burden Overview */}
      <SymptomBurdenChart data={data} />
      
      {/* System Interconnection Radar */}
      <SystemRadarChart data={data} patterns={patterns} />
      
      {/* Pattern Priority Visualization */}
      <PatternPriorityChart patterns={patterns} />
      
      {/* Health Trajectory Timeline */}
      <HealthTrajectoryTimeline patterns={patterns} data={data} />
      
      {/* Root Cause Web */}
      <RootCauseWeb patterns={patterns} />
    </div>
  )
}

const SymptomBurdenChart: React.FC<{ data: SymptomBurdenData }> = ({ data }) => {
  const systems = [
    { name: 'Upper GI', value: data.upperGI, max: 9 },
    { name: 'Small Intestine', value: data.smallIntestine, max: 9 },
    { name: 'Large Intestine', value: data.largeIntestine, max: 9 },
    { name: 'Liver/GB', value: data.liverGB, max: 9 },
    { name: 'Kidneys', value: data.kidneys, max: 9 },
    { name: 'Heart', value: data.cardiovascular, max: 9 },
    { name: 'Immune', value: data.immuneSystem, max: 9 },
    { name: 'Energy', value: data.energyProduction, max: 9 },
    { name: 'Thyroid', value: data.thyroid, max: 7 },
    { name: 'Adrenal', value: data.adrenal, max: 9 },
    { name: 'Hormones', value: data.femaleReprod || data.maleReprod || 0, max: 12 },
    { name: 'Blood Sugar', value: data.sugarHandling, max: 5 },
    { name: 'Joints', value: data.joints, max: 9 },
    { name: 'Skin', value: data.skin, max: 7 },
    { name: 'Brain', value: data.brain, max: 9 }
  ].sort((a, b) => (b.value / b.max) - (a.value / a.max))
  
  const chartData = {
    labels: systems.map(s => s.name),
    datasets: [{
      label: 'Symptom Burden',
      data: systems.map(s => s.value),
      backgroundColor: systems.map(s => {
        const percentage = s.value / s.max
        if (percentage >= 0.7) return 'rgba(220, 38, 38, 0.8)'  // red
        if (percentage >= 0.5) return 'rgba(251, 146, 60, 0.8)' // orange
        if (percentage >= 0.3) return 'rgba(250, 204, 21, 0.8)' // yellow
        return 'rgba(34, 197, 94, 0.8)' // green
      }),
      borderColor: systems.map(s => {
        const percentage = s.value / s.max
        if (percentage >= 0.7) return 'rgb(220, 38, 38)'
        if (percentage >= 0.5) return 'rgb(251, 146, 60)'
        if (percentage >= 0.3) return 'rgb(250, 204, 21)'
        return 'rgb(34, 197, 94)'
      }),
      borderWidth: 1
    }]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'System-by-System Symptom Burden',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const system = systems[context.dataIndex]
            const percentage = Math.round((system.value / system.max) * 100)
            return `${system.name}: ${system.value}/${system.max} (${percentage}%)`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Symptom Score'
        }
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="h-96">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2"></div>
          <span>Mild (0-30%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
          <span>Moderate (30-50%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 mr-2"></div>
          <span>Severe (50-70%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-2"></div>
          <span>Critical (70%+)</span>
        </div>
      </div>
    </div>
  )
}

const SystemRadarChart: React.FC<{ data: SymptomBurdenData, patterns: NAQPattern[] }> = ({ data, patterns }) => {
  const categories = [
    { name: 'Digestive', value: (data.upperGI + data.smallIntestine + data.largeIntestine) / 3, max: 9 },
    { name: 'Energy/Mito', value: data.energyProduction, max: 9 },
    { name: 'Hormonal', value: ((data.femaleReprod || 0) + (data.maleReprod || 0) + data.thyroid + data.adrenal) / 3, max: 9 },
    { name: 'Detox', value: (data.liverGB + data.kidneys) / 2, max: 9 },
    { name: 'Immune', value: data.immuneSystem, max: 9 },
    { name: 'Nervous', value: data.brain, max: 9 },
    { name: 'Metabolic', value: data.sugarHandling * 1.8, max: 9 }, // Scale to match
    { name: 'Structural', value: data.joints, max: 9 }
  ]
  
  const chartData = {
    labels: categories.map(c => c.name),
    datasets: [
      {
        label: 'Current State',
        data: categories.map(c => (c.value / c.max) * 100),
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: 'rgba(220, 38, 38, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(220, 38, 38, 1)'
      },
      {
        label: 'Optimal Range',
        data: categories.map(() => 20), // 20% is considered optimal
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Body Systems Integration Analysis',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value: any) => value + '%'
        }
      }
    }
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="h-96">
        <Radar data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Areas extending beyond the green zone indicate dysfunction requiring intervention
      </p>
    </div>
  )
}

const PatternPriorityChart: React.FC<{ patterns: NAQPattern[] }> = ({ patterns }) => {
  const priorityColors = {
    immediate: 'rgba(220, 38, 38, 0.8)',
    high: 'rgba(251, 146, 60, 0.8)',
    moderate: 'rgba(250, 204, 21, 0.8)',
    low: 'rgba(34, 197, 94, 0.8)'
  }
  
  const chartData = {
    labels: patterns.map(p => p.name),
    datasets: [{
      data: patterns.map(p => Math.round(p.confidence * 100)),
      backgroundColor: patterns.map(p => priorityColors[p.interventionPriority]),
      borderColor: patterns.map(p => priorityColors[p.interventionPriority].replace('0.8', '1')),
      borderWidth: 2
    }]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Functional Medicine Pattern Analysis',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const pattern = patterns[context.dataIndex]
            return [
              `Confidence: ${context.parsed}%`,
              `Priority: ${pattern.interventionPriority}`,
              `Systems affected: ${pattern.affectedSystems.length}`
            ]
          }
        }
      }
    },
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Pattern Confidence %'
        }
      }
    }
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold mb-2">Priority Levels:</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 mr-2"></div>
              <span>Immediate - Address within 1 week</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 mr-2"></div>
              <span>High - Address within 2-4 weeks</span>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="invisible">
            <h4 className="font-semibold mb-2">_</h4>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
            <span>Moderate - Address within 1-2 months</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-2"></div>
            <span>Low - Maintenance/prevention</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const HealthTrajectoryTimeline: React.FC<{ patterns: NAQPattern[], data: SymptomBurdenData }> = ({ patterns, data }) => {
  const phases = [
    { 
      name: 'Current State', 
      week: 0, 
      health: 100 - Math.min(90, (data.totalBurden / 321) * 100),
      color: 'bg-red-500'
    },
    { 
      name: 'Phase 1 Complete', 
      week: 2, 
      health: 100 - Math.min(90, (data.totalBurden / 321) * 100) + 10,
      color: 'bg-orange-500'
    },
    { 
      name: 'Phase 2 Complete', 
      week: 8, 
      health: 100 - Math.min(90, (data.totalBurden / 321) * 100) + 30,
      color: 'bg-yellow-500'
    },
    { 
      name: 'Phase 3 Complete', 
      week: 16, 
      health: 100 - Math.min(90, (data.totalBurden / 321) * 100) + 50,
      color: 'bg-green-500'
    },
    { 
      name: 'Maintenance', 
      week: 24, 
      health: Math.min(95, 100 - Math.min(90, (data.totalBurden / 321) * 100) + 60),
      color: 'bg-blue-500'
    }
  ]
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Expected Recovery Timeline</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200"></div>
        
        {/* Phase markers */}
        <div className="relative flex justify-between">
          {phases.map((phase, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${phase.color} z-10 flex items-center justify-center text-white font-bold text-sm`}>
                {index + 1}
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold">{phase.name}</p>
                <p className="text-xs text-gray-600">Week {phase.week}</p>
                <p className="text-xs font-medium text-green-600">{phase.health}% Health</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 space-y-2">
        <h4 className="font-semibold">Key Milestones:</h4>
        <ul className="text-sm space-y-1">
          <li>• Week 2: Initial symptom relief, improved energy</li>
          <li>• Week 8: 40-50% symptom reduction, systems stabilizing</li>
          <li>• Week 16: 70%+ improvement, optimal function returning</li>
          <li>• Week 24+: Maintenance phase, prevention focus</li>
        </ul>
      </div>
    </div>
  )
}

const RootCauseWeb: React.FC<{ patterns: NAQPattern[] }> = ({ patterns }) => {
  // Extract unique root causes from all patterns
  const allRootCauses = new Map<string, { patterns: string[], count: number }>()
  
  patterns.forEach(pattern => {
    pattern.rootCauseHierarchy.forEach(cause => {
      if (!allRootCauses.has(cause)) {
        allRootCauses.set(cause, { patterns: [], count: 0 })
      }
      const entry = allRootCauses.get(cause)!
      entry.patterns.push(pattern.name)
      entry.count++
    })
  })
  
  // Convert to array and sort by frequency
  const rootCauseData = Array.from(allRootCauses.entries())
    .map(([cause, data]) => ({
      cause,
      ...data
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6) // Top 6 root causes
  
  const chartData = {
    labels: rootCauseData.map(d => d.cause),
    datasets: [{
      data: rootCauseData.map(d => d.count),
      backgroundColor: [
        'rgba(220, 38, 38, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(250, 204, 21, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)'
      ],
      borderWidth: 0
    }]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          generateLabels: (chart: any) => {
            const data = chart.data
            return data.labels.map((label: string, i: number) => ({
              text: label.length > 30 ? label.substring(0, 30) + '...' : label,
              fillStyle: data.datasets[0].backgroundColor[i],
              hidden: false,
              index: i
            }))
          }
        }
      },
      title: {
        display: true,
        text: 'Root Cause Analysis',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const rootCause = rootCauseData[context.dataIndex]
            return [
              `Appears in ${context.parsed} patterns:`,
              ...rootCause.patterns.map(p => `  • ${p}`)
            ]
          }
        }
      }
    }
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600 text-center">
          Addressing root causes in order of frequency provides the most comprehensive healing
        </p>
      </div>
    </div>
  )
}

export default NAQReportVisuals