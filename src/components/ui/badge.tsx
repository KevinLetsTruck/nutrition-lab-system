import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'green' | 'blue' | 'orange' | 'purple' | 'fntp'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', size = 'md', children, className, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-colors'
    
    const variants = {
      default: 'bg-dark-700 text-dark-300 border border-dark-600',
      green: 'bg-green-600/20 text-green-400 border border-green-500/30',
      blue: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
      orange: 'bg-orange-600/20 text-orange-400 border border-orange-500/30',
      purple: 'bg-purple-600/20 text-purple-400 border border-purple-500/30',
      fntp: 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border border-green-500/40 font-semibold'
    }
    
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    }
    
    return (
      <div
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge } 