import React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
  containerClassName?: string
  iconClassName?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, iconClassName, onSearch, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onSearch?.(e.target.value)
    }

    return (
      <div className={cn(
        "relative flex items-center w-full",
        containerClassName
      )}>
        {/* Search Icon - Positioned properly */}
        <Search 
          className={cn(
            "absolute left-3 h-4 w-4 text-foreground-muted pointer-events-none z-0",
            iconClassName
          )} 
        />
        
        {/* Input with proper left padding */}
        <input
          ref={ref}
          type="text"
          className={cn(
            // Base styling
            "flex h-11 w-full rounded-lg border border-input bg-input text-foreground",
            // Proper padding for icon space
            "pl-10 pr-4 py-2",
            // Typography
            "text-sm placeholder:text-foreground-muted",
            // Focus states
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            // Hover states  
            "hover:border-primary/50",
            // Transitions
            "transition-all duration-200",
            // Disabled states
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Ensure text is above icon
            "relative z-10",
            className
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
    )
  }
)

SearchInput.displayName = "SearchInput"