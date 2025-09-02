import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "gap-6 py-6",
        elevated: "gap-6 py-6 shadow-lg hover:shadow-xl",
        outlined: "gap-6 py-6 border-2",
        enhanced: "gap-4 p-4 bg-card hover:bg-muted", // Using proper Shadcn variables
        interactive: "gap-4 p-4 hover:shadow-xl hover:scale-[1.02] cursor-pointer bg-card hover:bg-muted",
        stats: "gap-3 p-4 bg-card hover:shadow-lg", // Using proper Shadcn variables
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4", 
        lg: "p-6",
        xl: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Card({ className, variant, padding, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

// Enhanced Card component that mimics card-enhanced behavior
function EnhancedCard({ className, children, hover = false, ...props }) {
  return (
    <Card
      variant="enhanced"
      className={cn(
        "rounded-xl", // Override default rounded-xl from variant
        hover && "hover:shadow-xl transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}

// Interactive Card for dashboard items and clickable cards
function InteractiveCard({ className, children, onClick, ...props }) {
  return (
    <Card
      variant="interactive"
      className={cn(
        "rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      {...props}
    >
      {children}
    </Card>
  )
}

// Stats Card for dashboard statistics
function StatsCard({ className, children, ...props }) {
  return (
    <Card
      variant="stats"
      className={cn("rounded-xl", className)}
      {...props}
    >
      {children}
    </Card>
  )
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  EnhancedCard,
  InteractiveCard,
  StatsCard,
}