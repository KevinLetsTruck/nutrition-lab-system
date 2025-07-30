import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href?: string
  onClick?: () => void
  className?: string
}

export function ActionCard({ 
  icon, 
  title, 
  description, 
  href, 
  onClick, 
  className 
}: ActionCardProps) {
  const content = (
    <Card className={cn(
      "bg-dark-800/50 border-dark-700 hover:bg-dark-750 transition-all duration-200 cursor-pointer group",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-dark-700/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
            <p className="text-dark-300 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return content
} 