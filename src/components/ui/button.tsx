import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white border border-blue-500 shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all",
        destructive:
          "bg-red-600 text-white border border-red-500 shadow-sm hover:bg-red-700",
        outline:
          "border-2 border-gray-600 bg-transparent text-gray-300 shadow-sm hover:bg-gray-800 hover:border-gray-500",
        secondary:
          "bg-gray-800 text-gray-300 border border-gray-700 shadow-sm hover:bg-gray-700 hover:border-gray-600",
        ghost: "text-gray-300 hover:bg-gray-800 hover:text-white",
        link: "text-blue-500 underline-offset-4 hover:underline hover:text-blue-400",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
