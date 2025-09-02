import * as React from "react"
import { Checkbox } from "./checkbox"
import { Label } from "./label"
import { cn } from "../../lib/utils"

const CheckboxField = React.forwardRef(({
  label,
  description,
  error,
  className,
  id,
  children,
  ...props
}, ref) => {
  const checkboxId = id || React.useId()
  const errorId = `${checkboxId}-error`
  const descriptionId = `${checkboxId}-description`

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start space-x-2">
        <Checkbox
          ref={ref}
          id={checkboxId}
          className={cn(
            "mt-0.5", // Align with first line of text
            error && "border-destructive"
          )}
          aria-describedby={cn(
            error && errorId,
            description && descriptionId
          )}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        <div className="grid gap-1.5 leading-none">
          {label && (
            <Label 
              htmlFor={checkboxId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </Label>
          )}
          {description && (
            <p id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {children}
      
      {error && (
        <p id={errorId} className="text-sm text-destructive flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
})

CheckboxField.displayName = "CheckboxField"

export { CheckboxField }