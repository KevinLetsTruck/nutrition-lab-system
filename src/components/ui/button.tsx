import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-button text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5",
        primary: "bg-primary text-primary-foreground shadow-lg shadow-emerald-500/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5",
        secondary: "bg-card text-foreground border border-border hover:bg-card-hover hover:border-primary/50 shadow-lg",
        ghost: "text-foreground hover:bg-card hover:text-primary",
        outline: "border border-border bg-transparent text-foreground hover:bg-card hover:border-primary",
        success: "bg-success text-success-foreground shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30",
        warning: "bg-warning text-warning-foreground shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30",
        destructive: "bg-destructive text-destructive-foreground shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "button" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }