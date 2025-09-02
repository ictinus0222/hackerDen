"use client"

import { Toaster as Sonner } from "sonner"
import { cn } from "../../lib/utils"

function Toaster({ className, ...props }) {
  return (
    <Sonner
      theme="dark"
      className={cn("toaster group", className)}
      style={{
        "--normal-bg": "hsl(var(--popover))",
        "--normal-text": "hsl(var(--popover-foreground))",
        "--normal-border": "hsl(var(--border))",
        "--success-bg": "hsl(var(--success))",
        "--success-text": "hsl(var(--success-foreground))",
        "--error-bg": "hsl(var(--destructive))",
        "--error-text": "hsl(var(--destructive-foreground))",
        "--warning-bg": "hsl(var(--warning))",
        "--warning-text": "hsl(var(--warning-foreground))",
      }}
      {...props}
    />
  )
}

export { Toaster }
