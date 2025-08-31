import * as React from "react"
import { Input } from "./input"
import { Label } from "./label"
import { cn } from "../../lib/utils"

const InputField = React.forwardRef(({
  label,
  error,
  description,
  required = false,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || React.useId()
  const errorId = `${inputId}-error`
  const descriptionId = `${inputId}-description`

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>
      )}
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <Input
        ref={ref}
        id={inputId}
        error={error}
        aria-describedby={cn(
          error && errorId,
          description && descriptionId
        )}
        required={required}
        {...props}
      />
      
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

InputField.displayName = "InputField"

export { InputField }