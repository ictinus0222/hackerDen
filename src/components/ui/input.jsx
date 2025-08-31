import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border bg-background text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input px-3 py-2 h-10",
        search: "border-input px-3 py-2 h-10 pl-10", // Space for search icon
        password: "border-input px-3 py-2 h-10 pr-10", // Space for visibility toggle
        email: "border-input px-3 py-2 h-10",
        large: "border-input px-4 py-3 h-12 text-base", // Larger for mobile
        compact: "border-input px-2 py-1 h-8 text-xs", // Smaller variant
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
      }
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
)

function Input({
  className,
  variant,
  state,
  type,
  error,
  ...props
}) {
  // Automatically set error state if error prop is provided
  const inputState = error ? "error" : state;
  
  return (
    <input
      type={type}
      className={cn(inputVariants({ variant, state: inputState, className }))}
      aria-invalid={error ? "true" : "false"}
      {...props}
    />
  )
}

export { Input }