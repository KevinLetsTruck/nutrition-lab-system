'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface HealthScoreCardProps {
  title: string
  score: number
  icon: LucideIcon
  description?: string
  className?: string
}

export default function HealthScoreCard({
  title,
  score,
  icon: Icon,
  description,
  className
}: HealthScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    if (score >= 40) return 'bg-orange-600'
    return 'bg-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Optimal'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Suboptimal'
    return 'Poor'
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline space-x-2">
            <div className={cn("text-3xl font-bold", getScoreColor(score))}>
              {score}
            </div>
            <div className="text-sm text-muted-foreground">/100</div>
          </div>
          
          <Progress 
            value={score} 
            className="h-2"
            indicatorClassName={getProgressColor(score)}
          />
          
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium">{getScoreLabel(score)}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}