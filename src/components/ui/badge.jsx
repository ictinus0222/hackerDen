import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Custom variants for task status
        todo:
          "border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/90",
        "in-progress":
          "border-transparent bg-primary/20 text-primary border-primary/30 [a&]:hover:bg-primary/30",
        blocked:
          "border-transparent bg-destructive/20 text-destructive border-destructive/30 [a&]:hover:bg-destructive/30",
        done:
          "border-transparent bg-green-500/20 text-green-400 border-green-500/30 [a&]:hover:bg-green-500/30",
        // Custom variants for priority
        "priority-high":
          "border-transparent bg-destructive/20 text-destructive border-destructive/30 [a&]:hover:bg-destructive/30",
        "priority-medium":
          "border-transparent bg-yellow-500/20 text-yellow-400 border-yellow-500/30 [a&]:hover:bg-yellow-500/30",
        "priority-low":
          "border-transparent bg-primary/20 text-primary border-primary/30 [a&]:hover:bg-primary/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }