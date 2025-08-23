import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-xl bg-gray-900/50 border-2 border-gray-700",
          "px-3 py-2 text-sm text-gray-100",
          "cursor-pointer",
          "focus:outline-none focus:ring-2",
          "focus:ring-blue-500 focus:border-blue-500",
          "transition-all",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&>option]:bg-gray-900 [&>option]:text-gray-100",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
